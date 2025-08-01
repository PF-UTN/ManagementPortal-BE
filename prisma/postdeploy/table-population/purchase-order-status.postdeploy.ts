import { PurchaseOrderStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const purchaseOrderStatusPostDeployAsync = async () => {
  const sourceData: PurchaseOrderStatus[] = [
    { id: 1, name: 'Draft' },
    { id: 2, name: 'Pending' },
    { id: 3, name: 'Cancelled' },
    { id: 4, name: 'Ordered' },
    { id: 5, name: 'Received' },
    { id: 6, name: 'Deleted' },
  ];

  await mergeTableData('PurchaseOrderStatus', sourceData);
};
