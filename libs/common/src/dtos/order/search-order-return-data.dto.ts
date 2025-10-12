export class SearchOrderReturnDataDto {
  id: number;
  createdAt: Date;
  clientName: string;
  orderStatus: string;
  totalAmount: number;
  shipmentId: number | null;
}
