import { DeliveryMethodId } from './delivery-methods.constants';
import { OrderStatusId } from './order-status.constant';

export const MercadoPagoPaymentCodeToIdMap: Record<string, number> = {
  approved: 1,
  rejected: 2,
  cancelled: 3,
  pending: 4,
  in_process: 5,
};

export enum MercadoPagoPaymentStatus {
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Pending = 'pending',
  InProcess = 'in_process',
}

export function getOrderStatusFromPaymentAndDeliveryMethod(
  mpStatus: MercadoPagoPaymentStatus,
  deliveryTypeId: DeliveryMethodId,
): OrderStatusId {
  switch (mpStatus) {
    case MercadoPagoPaymentStatus.Approved:
      if (deliveryTypeId === DeliveryMethodId.PickUpAtStore) {
        return OrderStatusId.InPreparation;
      }
      return OrderStatusId.Pending;

    case MercadoPagoPaymentStatus.Rejected:
    case MercadoPagoPaymentStatus.Cancelled:
      return OrderStatusId.PaymentRejected;

    case MercadoPagoPaymentStatus.Pending:
    case MercadoPagoPaymentStatus.InProcess:
      return OrderStatusId.PaymentPending;

    default:
      return OrderStatusId.PaymentPending;
  }
}
