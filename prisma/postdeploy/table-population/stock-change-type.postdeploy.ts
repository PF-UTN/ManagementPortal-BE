import { StockChangeType } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const stockChangeTypePostDeployAsync = async () => {
  const sourceData: StockChangeType[] = [
    { id: 1, name: 'Ingreso', description: 'Ingreso de mercadería al stock' },
    { id: 2, name: 'Egreso', description: 'Egreso de mercadería del stock' },
    { id: 3, name: 'Ajuste', description: 'Ajuste de stock' },
  ];

  await mergeTableData('StockChangeType', sourceData);
};
