import { OrderStatusId } from './order-status.constant';

const validTransitions: Record<OrderStatusId, OrderStatusId[]> = {
  [OrderStatusId.PaymentPending]: [
    OrderStatusId.Pending,
    OrderStatusId.InPreparation,
    OrderStatusId.Cancelled,
    OrderStatusId.PaymentRejected,
  ],
  [OrderStatusId.PaymentRejected]: [
    OrderStatusId.Cancelled,
    OrderStatusId.PaymentPending,
  ],
  [OrderStatusId.Pending]: [
    OrderStatusId.InPreparation,
    OrderStatusId.Cancelled,
  ],
  [OrderStatusId.InPreparation]: [
    OrderStatusId.Prepared,
    OrderStatusId.Cancelled,
  ],
  [OrderStatusId.Prepared]: [OrderStatusId.Shipped, OrderStatusId.Finished],
  [OrderStatusId.Shipped]: [OrderStatusId.Finished],
  [OrderStatusId.Finished]: [],
  [OrderStatusId.Cancelled]: [],
};

export function canOrderTransition(
  from: OrderStatusId,
  to: OrderStatusId,
): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}
