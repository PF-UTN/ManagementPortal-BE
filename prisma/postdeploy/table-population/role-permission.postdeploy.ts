import { RolePermission } from '@prisma/client';
import { mergeTableData } from './generate-merge-data.script';

export const rolePermissionPostDeployAsync = async () => {
  const sourceData: RolePermission[] = [
    { roleId: 1, permissionId: 1 },
    { roleId: 1, permissionId: 2 },
    { roleId: 1, permissionId: 3 },
    { roleId: 1, permissionId: 4 },
  ];

  await mergeTableData('RolePermission', sourceData, [
    'roleId',
    'permissionId',
  ]);
};
