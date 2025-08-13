import { PurchaseOrderStatusId } from './purchase-order-status.constant';

const validTransitions: Record<PurchaseOrderStatusId, PurchaseOrderStatusId[]> =
  {
    [PurchaseOrderStatusId.Draft]: [
      PurchaseOrderStatusId.Ordered,
      PurchaseOrderStatusId.Cancelled,
      PurchaseOrderStatusId.Deleted,
    ],
    [PurchaseOrderStatusId.Ordered]: [
      PurchaseOrderStatusId.Cancelled,
      PurchaseOrderStatusId.Received,
    ],
    [PurchaseOrderStatusId.Cancelled]: [],
    [PurchaseOrderStatusId.Received]: [],
    [PurchaseOrderStatusId.Deleted]: [],
  };

export function canTransition(
  from: PurchaseOrderStatusId,
  to: PurchaseOrderStatusId,
): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}
