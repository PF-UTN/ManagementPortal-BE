import { protos } from '@googlemaps/routeoptimization';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  DeliveryMethodId,
  OrderStatusId,
  ShipmentStatusId,
} from '@mp/common/constants';
import {
  FinishShipmentDto,
  ShipmentCreationDataDto,
  ShipmentCreationDto,
  ShipmentReportGenerationDataDto,
  VehicleUsageCreationDataDto,
} from '@mp/common/dtos';
import { ReportService } from '@mp/common/services';
import {
  ShipmentRepository,
  VehicleRepository,
  OrderRepository,
  VehicleUsageRepository,
} from '@mp/repository';

import { inngest } from '../../../configuration';
import { DownloadShipmentQuery } from '../../../controllers/shipment/query/download-shipment.query';
import { SearchShipmentQuery } from '../../../controllers/shipment/query/search-shipment.query';
import { GoogleMapsRoutingService } from '../../../services/google-maps-routing.service';

@Injectable()
export class ShipmentService {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly orderRepository: OrderRepository,
    private readonly vehicleUsageRepository: VehicleUsageRepository,
    private readonly googleMapsRoutingService: GoogleMapsRoutingService,
    private readonly reportService: ReportService,
  ) {}

  async createShipmentAsync(shipmentCreationDto: ShipmentCreationDto) {
    const existsVehicle = await this.vehicleRepository.existsAsync(
      shipmentCreationDto.vehicleId,
    );

    if (!existsVehicle) {
      throw new NotFoundException(
        `Vehicle with id ${shipmentCreationDto.vehicleId} does not exist.`,
      );
    }

    const ordersExist =
      await this.orderRepository.existsManyPendingUnassignedAsync(
        shipmentCreationDto.orderIds,
      );

    if (!ordersExist) {
      throw new NotFoundException(
        `One or more orders do not exist, are not Pending, or are already assigned to a shipment.`,
      );
    }

    const shipmentCreationDataDto: ShipmentCreationDataDto = {
      date: shipmentCreationDto.date,
      statusId: ShipmentStatusId.Pending,
      vehicleId: shipmentCreationDto.vehicleId,
      orderIds: shipmentCreationDto.orderIds,
    };

    const updateOrdersTask = this.orderRepository.updateManyOrderStatusAsync(
      shipmentCreationDataDto.orderIds,
      OrderStatusId.InPreparation,
    );

    const shipmentCreationTask = this.shipmentRepository.createShipmentAsync(
      shipmentCreationDataDto,
    );

    const [, createdShipment] = await Promise.all([
      updateOrdersTask,
      shipmentCreationTask,
    ]);

    inngest.send({
      name: 'create.shipment',
      data: {
        shipment: createdShipment,
        newStatus: OrderStatusId.InPreparation,
      },
    });
  }

  async sendShipmentAsync(id: number) {
    const shipment = await this.shipmentRepository.findByIdAsync(id);

    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} does not exists`);
    }

    if (shipment.statusId !== ShipmentStatusId.Pending) {
      throw new BadRequestException(`Shipment status is not pending`);
    }

    const allOrdersPending = shipment.orders.every(
      (order) => order.orderStatusId === OrderStatusId.Prepared,
    );

    if (!allOrdersPending) {
      throw new BadRequestException(`Not all orders are prepared`);
    }

    const allOrdersHomeDelivery = shipment.orders.every(
      (order) => order.deliveryMethodId === DeliveryMethodId.HomeDelivery,
    );

    if (!allOrdersHomeDelivery) {
      throw new BadRequestException(
        `Not all orders delivery method is home delivery`,
      );
    }

    const orderIds = shipment.orders.map((order) => order.id);

    const updateOrderTask = this.orderRepository.updateManyOrderStatusAsync(
      orderIds,
      OrderStatusId.Shipped,
    );

    const shipmentUpdateTask = this.shipmentRepository.updateShipmentAsync(
      shipment.id,
      { statusId: ShipmentStatusId.Shipped },
    );

    await Promise.all([updateOrderTask, shipmentUpdateTask]);

    inngest.send({
      name: 'send.shipment',
      data: {
        shipment,
        newStatus: OrderStatusId.Shipped,
        currentStatus: OrderStatusId.Prepared,
      },
    });
  }

  async finishShipmentAsync(id: number, finishShipmentDto: FinishShipmentDto) {
    const shipment = await this.shipmentRepository.findByIdAsync(id);

    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} does not exists`);
    }

    if (shipment.statusId !== ShipmentStatusId.Shipped) {
      throw new BadRequestException(`Shipment status is not shipped`);
    }

    const dtoOrderIds = finishShipmentDto.orders.map((o) => o.orderId);
    const shipmentOrderIds = shipment.orders.map((o) => o.id);

    const invalidOrderIds = dtoOrderIds.filter(
      (orderId) => !shipmentOrderIds.includes(orderId),
    );

    if (invalidOrderIds.length > 0) {
      throw new BadRequestException(
        `The following orders do not belong to shipment ${id}: ${invalidOrderIds.join(
          ', ',
        )}`,
      );
    }

    const missingOrderIds = shipmentOrderIds.filter(
      (orderId) => !dtoOrderIds.includes(orderId),
    );
    if (missingOrderIds.length > 0) {
      throw new BadRequestException(
        `The following orders from shipment ${id} are missing in finishShipmentDto: ${missingOrderIds.join(
          ', ',
        )}`,
      );
    }

    const lastVehicleUsage =
      await this.vehicleUsageRepository.findLastByVehicleIdAsync(
        shipment.vehicleId,
      );

    const lastOdometer =
      lastVehicleUsage?.odometer ??
      (await this.vehicleRepository.findByIdAsync(shipment.vehicleId))!
        .kmTraveled;

    if (Number(lastOdometer) > finishShipmentDto.odometer) {
      throw new BadRequestException(
        `The new odometer value (${finishShipmentDto.odometer}) cannot be less than the previously registered value (${lastOdometer}).`,
      );
    }

    if (
      lastVehicleUsage &&
      new Date(finishShipmentDto.finishedAt) < new Date(lastVehicleUsage.date)
    ) {
      throw new BadRequestException(
        `The provided finish date (${finishShipmentDto.finishedAt}) cannot be earlier than the last registered usage date (${lastVehicleUsage.date.toISOString()}).`,
      );
    }

    const vehicleUsageCreationDataDto: VehicleUsageCreationDataDto = {
      date: finishShipmentDto.finishedAt,
      vehicleId: shipment.vehicleId,
      odometer: finishShipmentDto.odometer,
      kmUsed: finishShipmentDto.odometer - Number(lastOdometer),
    };

    const orderUpdateTasks = finishShipmentDto.orders.map((order) => {
      const data: Prisma.OrderUncheckedUpdateInput = {
        orderStatusId: order.orderStatusId,
      };

      if (order.orderStatusId === OrderStatusId.Pending) {
        data.shipmentId = null;
      }

      return this.orderRepository.updateOrderAsync(order.orderId, data);
    });

    const shipmentUpdateTask = this.shipmentRepository.updateShipmentAsync(
      shipment.id,
      {
        statusId: ShipmentStatusId.Finished,
        finishedAt: finishShipmentDto.finishedAt,
        effectiveKm: finishShipmentDto.odometer - Number(lastOdometer),
      },
    );

    await Promise.all([orderUpdateTasks, shipmentUpdateTask]);

    inngest.send({
      name: 'finish.shipment',
      data: {
        shipment,
        finishShipmentDto,
        vehicleUsageCreationDataDto,
      },
    });
  }

  async getOrCreateShipmentRoute(shipmentId: number) {
    const shipment = await this.shipmentRepository.findByIdAsync(shipmentId);

    if (shipment?.routeLink) {
      return shipment.routeLink;
    }

    const shipments: protos.google.maps.routeoptimization.v1.IShipment[] =
      await Promise.all(
        shipment!.orders.map(async (order) => {
          const fullClientAddress = `${order.client.address.street}, ${order.client.address.streetNumber}, ${order.client.address.town.name}, ${order.client.address.town.province.name}, ${order.client.address.town.province.country.name}`;
          const clientCoords =
            await this.googleMapsRoutingService.geocodeAsync(fullClientAddress);

          return {
            deliveries: [
              {
                arrivalLocation: {
                  latitude: clientCoords.lat,
                  longitude: clientCoords.lng,
                },
                duration: { seconds: 300 },
              },
            ],
          } as protos.google.maps.routeoptimization.v1.IShipment;
        }),
      );

    const { routeLink, estimatedKm } =
      await this.googleMapsRoutingService.batchOptimizeToursAsync({
        shipments,
      });

    await this.shipmentRepository.updateShipmentAsync(shipmentId, {
      routeLink,
      estimatedKm,
    });

    return routeLink!;
  }

  async findByIdAsync(id: number) {
    const shipment = await this.shipmentRepository.findByIdAsync(id);

    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} does not exists.`);
    }

    return shipment;
  }

  async searchWithFiltersAsync(query: SearchShipmentQuery) {
    return this.shipmentRepository.searchWithFiltersAsync(
      query.page,
      query.pageSize,
      query.searchText,
      query.filters,
    );
  }

  async downloadWithFiltersAsync(query: DownloadShipmentQuery) {
    return this.shipmentRepository.downloadWithFiltersAsync(
      query.searchText,
      query.filters,
    );
  }

  async downloadReportAsync(id: number) {
    const shipment = await this.shipmentRepository.findReportDataByIdAsync(id);

    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} does not exists.`);
    }

    const dto: ShipmentReportGenerationDataDto = {
      shipmentId: shipment.id,
      date: shipment.date,
      estimatedKm: shipment.estimatedKm
        ? Number(shipment.estimatedKm)
        : undefined,
      effectiveKm: shipment.effectiveKm
        ? Number(shipment.effectiveKm)
        : undefined,
      finishedAt: shipment.finishedAt ?? undefined,
      routeLink: shipment.routeLink ?? undefined,
      vehiclePlate: shipment.vehicle.licensePlate,
      vehicleDescription: `${shipment.vehicle.brand} ${shipment.vehicle.model}`,
      driverName: '-',
      orders: shipment.orders.map((o) => ({
        orderId: o.id,
        clientName:
          `${o.client.user.firstName ?? ''} ${o.client.user.lastName ?? ''}`.trim() ||
          o.client.user.email,
        clientAddress: `${o.client.address.street} ${o.client.address.streetNumber}, ${o.client.address.town.name}, ${o.client.address.town.province.name}, ${o.client.address.town.province.country.name}`,
        clientPhone: o.client.user.phone ?? undefined,
        deliveryMethod: o.deliveryMethod?.name ?? '',
        paymentMethod: o.paymentDetail?.paymentType?.id ?? undefined,
        totalAmount: Number(o.totalAmount ?? 0),
        items: o.orderItems.map((it) => ({
          productName: it.product.name,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          subtotalPrice: Number(it.subtotalPrice),
        })),
      })),
    };

    const pdfDoc = await this.reportService.generateShipmentReport(dto);

    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    return {
      fileName: `shipment-${shipment.id}.pdf`,
      contentType: 'application/pdf',
      buffer,
    };
  }
}
