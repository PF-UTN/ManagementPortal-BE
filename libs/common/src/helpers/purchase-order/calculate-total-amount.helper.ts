import { PurchaseOrderItemDto } from '@mp/common/dtos';

export function calculateTotalAmount(items: PurchaseOrderItemDto[]): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * Number(item.unitPrice);
  }, 0);
}
