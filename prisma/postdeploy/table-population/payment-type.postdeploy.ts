import { PaymentType } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const paymentTypePostDeployAsync = async () => {
  const sourceData: PaymentType[] = [
    { id: 1, name: 'Credit/Debit card', description: 'Visa, MasterCard, Amex' },
    { id: 2, name: 'Upon delivery', description: 'Payment upon delivery' },
  ];

  await mergeTableData('PaymentType', sourceData);
};
