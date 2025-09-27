import { OrderStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const orderStatusPostDeployAsync = async () => {
  const sourceData: OrderStatus[] = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'InPreparation' },
    { id: 3, name: 'Shipped' },
    { id: 4, name: 'Finished' },
    { id: 5, name: 'Cancelled' },
    { id: 6, name: 'Prepared' },
    { id: 7, name: 'PaymentPending' },
    { id: 8, name: 'PaymentRejected' },
  ];

  await mergeTableData('OrderStatus', sourceData);
};
