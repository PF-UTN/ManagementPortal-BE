import { PurchaseOrderItemDetailsDto } from '../purchase-order-item';

export class PurchaseOrderDetailsDto {
  id: number;
  createdAt: Date;
  estimatedDeliveryDate: Date;
  effectiveDeliveryDate: Date | null;
  observation: string | null;
  totalAmount: number;
  status: {
    id: number;
    name: string;
  };
  supplier: PurchaseOrderDetailSupplierDto;
  purchaseOrderItems: PurchaseOrderItemDetailsDto[];
}

export class PurchaseOrderDetailSupplierDto {
  id: number;
  businessName: string;
}
