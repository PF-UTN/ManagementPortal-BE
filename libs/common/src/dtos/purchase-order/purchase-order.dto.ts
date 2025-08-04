export class PurchaseOrderDto {
  id: number;
  supplierBussinesName: string;
  purchaseOrderStatusName: string;
  createdAt: Date;
  effectiveDeliveryDate: Date | null;
  totalAmount: number;
}