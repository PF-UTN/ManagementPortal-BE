import { PurchaseOrderStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const purchaseOrderStatusPostDeployAsync = async () => {
  const sourceData: PurchaseOrderStatus[] = [
    { id: 1, name: 'Borrador' },
    { id: 2, name: 'Pendiente' },
    { id: 3, name: 'Cancelada' },
    { id: 4, name: 'Pedida' },
    { id: 5, name: 'Recibida' },
  ];

  await mergeTableData('PurchaseOrderStatus', sourceData);
};
