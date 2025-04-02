import { Role } from '@prisma/client';
import { mergeTableData } from './generate-merge-data.script';

export const rolePostDeployAsync = async () => {
  const sourceData: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Client' },
    { id: 3, name: 'Employee' },
  ];

  await mergeTableData('Role', sourceData);
};
