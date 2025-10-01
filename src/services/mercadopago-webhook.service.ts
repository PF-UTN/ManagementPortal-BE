import { Injectable } from '@nestjs/common';

import {
  MercadoPagoPaymentCodeToIdMap,
  MercadoPagoPaymentStatus,
} from '../../libs/common/src/constants/mercado-pago.constants';
import { MercadoPagoWebhookRequest } from '../../libs/common/src/dtos/mercado-pago/mercadopago-request.dto';
import { MercadoPagoService } from '../../libs/common/src/services';
import { PrismaService } from '../../libs/repository/src';

@Injectable()
export class MercadoPagoWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mpService: MercadoPagoService,
  ) {}

  async processWebhook(payload: MercadoPagoWebhookRequest) {
    const paymentId = payload?.data?.id;
    if (!paymentId) return;

    const mpPayment = await this.mpService.getPaymentDetailsAsync(paymentId);

    if (mpPayment.status == MercadoPagoPaymentStatus.InProcess) {
      return;
    }

    const orderId = mpPayment.external_reference
      ? Number(mpPayment.external_reference)
      : null;
    if (!orderId) {
      throw new Error(
        'No orderId provided in Mercado Pago payment notification',
      );
    }

    const paymentStatusId = MercadoPagoPaymentCodeToIdMap[mpPayment.status!];

    await this.prisma.payment.upsert({
      where: { mpPaymentId: String(mpPayment.id) },
      update: {
        statusId: paymentStatusId,
        transactionAmount: mpPayment.transaction_amount,
        currencyId: mpPayment.currency_id,
        description: mpPayment.description,
        paymentMethod: mpPayment.payment_method_id,
        paymentType: mpPayment.payment_type_id,
        dateCreated: new Date(mpPayment.date_created!),
        dateApproved: mpPayment.date_approved
          ? new Date(mpPayment.date_approved)
          : null,
        dateLastUpdated: mpPayment.date_last_updated
          ? new Date(mpPayment.date_last_updated)
          : null,
      },
      create: {
        mpPaymentId: String(mpPayment.id),
        statusId: paymentStatusId,
        transactionAmount: mpPayment.transaction_amount,
        currencyId: mpPayment.currency_id,
        description: mpPayment.description,
        paymentMethod: mpPayment.payment_method_id,
        paymentType: mpPayment.payment_type_id,
        dateCreated: new Date(mpPayment.date_created!),
        dateApproved: mpPayment.date_approved
          ? new Date(mpPayment.date_approved)
          : null,
        dateLastUpdated: mpPayment.date_last_updated
          ? new Date(mpPayment.date_last_updated)
          : null,
        orderId,
      },
    });

    return { orderId, paymentStatus: mpPayment.status! };
  }
}
