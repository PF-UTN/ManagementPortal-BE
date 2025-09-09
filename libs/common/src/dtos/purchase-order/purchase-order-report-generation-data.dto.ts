import { PurchaseOrderItemReportGenerationDataDto } from '../purchase-order-item/purchase-order-item-report-generation-data.dto';

export class PurchaseOrderReportGenerationDataDto {
  purchaseOrderId: number;
  createdAt: Date;
  estimatedDeliveryDate: Date;
  supplierBusinessName: string;
  supplierDocumentType: string;
  supplierDocumentNumber: string;
  observation: string;
  totalAmount: number;
  purchaseOrderItems: PurchaseOrderItemReportGenerationDataDto[];
}
