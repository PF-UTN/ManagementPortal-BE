import { PaymentStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const paymentStatusPostDeployAsync = async () => {
  const sourceData: PaymentStatus[] = [
    { id: 1, code: 'approved' },
    { id: 2, code: 'rejected' },
    { id: 3, code: 'cancelled' },
    { id: 4, code: 'pending' },
    { id: 5, code: 'in_process' },
  ];

  await mergeTableData('PaymentStatus', sourceData);
};
