import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { OrderStatusId, ShipmentStatusId } from '@mp/common/constants';
import { ShipmentCreationDataDto, ShipmentCreationDto } from '@mp/common/dtos';
import { MailingService } from '@mp/common/services';
import {
  ShipmentRepository,
  VehicleRepository,
  OrderRepository,
  PrismaUnitOfWork,
} from '@mp/repository';

@Injectable()
export class ShipmentService {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly orderRepository: OrderRepository,
    private readonly mailingService: MailingService,
    private readonly unitOfWork: PrismaUnitOfWork,
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

    const ordersExist = await this.orderRepository.existsManyPendingAsync(
      shipmentCreationDto.orderIds,
    );

    if (!ordersExist) {
      throw new NotFoundException(
        `One or more orders do not exist or their status is not Pending.`,
      );
    }

    const shipmentCreationDataDto: ShipmentCreationDataDto = {
      date: shipmentCreationDto.date,
      statusId: ShipmentStatusId.Pending,
      vehicleId: shipmentCreationDto.vehicleId,
      orderIds: shipmentCreationDto.orderIds,
    };

    const shipment = await this.unitOfWork.execute(
      async (tx: Prisma.TransactionClient) => {
        const orderStatusUpdateTask =
          this.orderRepository.updateManyOrderStatusAsync(
            shipmentCreationDto.orderIds,
            OrderStatusId.InPreparation,
            tx,
          );
        const shipmentCreationTask =
          this.shipmentRepository.createShipmentAsync(
            shipmentCreationDataDto,
            tx,
          );

        const [, shipment] = await Promise.all([
          orderStatusUpdateTask,
          shipmentCreationTask,
        ]);

        return shipment;
      },
    );

    const orders = await this.orderRepository.findOrdersByShipmentIdAsync(
      shipment.id,
    );

    this.sendShipmentOrdersStatusEmail(orders);
  }

  async sendShipmentOrdersStatusEmail(
    orders: Prisma.OrderGetPayload<{
      include: { client: { include: { user: { select: { email: true } } } } };
    }>[],
  ) {
    for (const order of orders) {
      const email = order.client?.user?.email;

      const subject = 'Actualización de estado de su pedido';
      const text = `Su pedido #${order.id} se encuentra en preparación.`;

      this.mailingService.sendMailAsync(email, subject, text);
    }
  }
}
