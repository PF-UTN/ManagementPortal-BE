export type ShipmentOrderItemDto = {
  productName: string;
  quantity: number;
  unitPrice?: number;
  subtotalPrice?: number;
};

export type ShipmentOrderDto = {
  orderId: number;
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  deliveryMethod: string;
  totalAmount: number;
  items?: ShipmentOrderItemDto[];
};

export type ShipmentReportGenerationDataDto = {
  shipmentId: number;
  date: Date;
  estimatedKm?: number;
  effectiveKm?: number;
  finishedAt?: Date;
  routeLink?: string;

  vehiclePlate: string;
  vehicleDescription?: string;

  driverName: string;
  driverPhone?: string;

  orders: ShipmentOrderDto[];
};
