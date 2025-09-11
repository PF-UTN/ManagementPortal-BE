import { Decimal } from '@prisma/client/runtime/library';

export class DownloadPurchaseOrderItemDto {
  ID: number;
  Producto: string;
  Precio_Unitario: Decimal;
  Cantidad: number;
  Subtotal: Decimal;
}
