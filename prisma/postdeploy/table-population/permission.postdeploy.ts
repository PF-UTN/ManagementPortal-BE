import { Permission } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';
import { PermissionCodes } from '../../../libs/common/src/constants/permission-codes.constants';

export const permissionPostDeployAsync = async () => {
  const sourceData: Permission[] = [
    { id: 1, name: PermissionCodes.RegistrationRequest.READ },
    { id: 2, name: PermissionCodes.RegistrationRequest.CREATE },
    { id: 3, name: PermissionCodes.RegistrationRequest.UPDATE },
    { id: 4, name: PermissionCodes.RegistrationRequest.DELETE },
    { id: 5, name: PermissionCodes.Product.READ },
    { id: 6, name: PermissionCodes.Product.CREATE },
    { id: 7, name: PermissionCodes.Product.UPDATE },
    { id: 8, name: PermissionCodes.Product.DELETE },
    { id: 9, name: PermissionCodes.Supplier.READ },
    { id: 10, name: PermissionCodes.Supplier.CREATE },
    { id: 11, name: PermissionCodes.Supplier.UPDATE },
    { id: 12, name: PermissionCodes.Supplier.DELETE },
  ];

  await mergeTableData('Permission', sourceData);
};
