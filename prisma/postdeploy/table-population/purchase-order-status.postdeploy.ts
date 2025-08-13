import { PurchaseOrderStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const purchaseOrderStatusPostDeployAsync = async () => {
  const sourceData: PurchaseOrderStatus[] = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Cancelled' },
    { id: 3, name: 'Ordered' },
    { id: 4, name: 'Received' },
    { id: 5, name: 'Deleted' },
  ];

  await mergeTableData('PurchaseOrderStatus', sourceData);
};
