import { DeliveryMethod } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const deliveryMethodPostDeployAsync = async () => {
  const sourceData: DeliveryMethod[] = [
    { id: 1, name: 'Pick up at store' },
    { id: 2, name: 'Home delivery' },
  ];

  await mergeTableData('DeliveryMethod', sourceData);
};
