import { RolePermission } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const rolePermissionPostDeployAsync = async () => {
  const sourceData: RolePermission[] = [
    { roleId: 1, permissionId: 1 },
    { roleId: 1, permissionId: 2 },
    { roleId: 1, permissionId: 3 },
    { roleId: 1, permissionId: 4 },
    { roleId: 1, permissionId: 5 },
    { roleId: 1, permissionId: 6 },
    { roleId: 1, permissionId: 7 },
    { roleId: 1, permissionId: 8 },
    { roleId: 1, permissionId: 9 },
    { roleId: 1, permissionId: 10 },
    { roleId: 1, permissionId: 11 },
    { roleId: 1, permissionId: 12 },
    { roleId: 1, permissionId: 13 },
    { roleId: 1, permissionId: 14 },
    { roleId: 1, permissionId: 15 },
    { roleId: 1, permissionId: 16 },
    { roleId: 1, permissionId: 17 },
    { roleId: 1, permissionId: 18 },
    { roleId: 1, permissionId: 19 },
    { roleId: 1, permissionId: 20 },
    { roleId: 1, permissionId: 21 },
    { roleId: 1, permissionId: 22 },
    { roleId: 1, permissionId: 23 },
    { roleId: 1, permissionId: 24 },
    { roleId: 1, permissionId: 25 },
    { roleId: 1, permissionId: 26 },
    { roleId: 1, permissionId: 27 },
    { roleId: 1, permissionId: 28 },
    { roleId: 1, permissionId: 29 },
    { roleId: 1, permissionId: 30 },
    { roleId: 1, permissionId: 31 },
    { roleId: 1, permissionId: 32 },
    { roleId: 1, permissionId: 33 },
    { roleId: 1, permissionId: 34 },
    { roleId: 1, permissionId: 35 },
    { roleId: 1, permissionId: 36 },
    { roleId: 2, permissionId: 29 },
    { roleId: 2, permissionId: 30 },
    { roleId: 2, permissionId: 31 },
    { roleId: 2, permissionId: 32 },
    { roleId: 2, permissionId: 33 },
    { roleId: 2, permissionId: 34 },
    { roleId: 2, permissionId: 35 },
    { roleId: 2, permissionId: 36 },
  ];

  await mergeTableData('RolePermission', sourceData, [
    'roleId',
    'permissionId',
  ]);
};
