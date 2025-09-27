import { PaymentType } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const paymentTypePostDeployAsync = async () => {
  const sourceData: PaymentType[] = [
    { id: 1, name: 'CreditDebitCard', description: 'Visa, MasterCard, Amex' },
    { id: 2, name: 'UponDelivery', description: 'Payment upon delivery' },
  ];

  await mergeTableData('PaymentType', sourceData);
};
