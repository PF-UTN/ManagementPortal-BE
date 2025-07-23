import { PurchaseOrderStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const purchaseOrderStatusPostDeployAsync = async () => {
  const sourceData: PurchaseOrderStatus[] = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Pending' },
    { id: 3, name: 'Rejected' },
    { id: 4, name: 'Ordered' },
    { id: 5, name: 'Received' },
  ];

  await mergeTableData('PurchaseOrderStatus', sourceData);
};
