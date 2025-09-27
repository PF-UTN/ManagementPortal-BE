import { DeliveryMethod } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const deliveryMethodPostDeployAsync = async () => {
  const sourceData: DeliveryMethod[] = [
    { id: 1, name: 'PickUpAtStore' },
    { id: 2, name: 'HomeDelivery' },
  ];

  await mergeTableData('DeliveryMethod', sourceData);
};
