import { ShipmentStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const shipmentStatusPostDeployAsync = async () => {
  const sourceData: ShipmentStatus[] = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Shipped' },
    { id: 3, name: 'Finished' },
  ];

  await mergeTableData('ShipmentStatus', sourceData);
};
