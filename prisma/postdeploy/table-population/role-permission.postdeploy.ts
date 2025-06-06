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
  ];

  await mergeTableData('RolePermission', sourceData, [
    'roleId',
    'permissionId',
  ]);
};
