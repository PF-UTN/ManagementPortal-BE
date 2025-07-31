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
    { id: 9, name: PermissionCodes.ProductCategory.READ },
    { id: 10, name: PermissionCodes.ProductCategory.CREATE },
    { id: 11, name: PermissionCodes.ProductCategory.UPDATE },
    { id: 12, name: PermissionCodes.ProductCategory.DELETE },
    { id: 13, name: PermissionCodes.Supplier.READ },
    { id: 14, name: PermissionCodes.Supplier.CREATE },
    { id: 15, name: PermissionCodes.Supplier.UPDATE },
    { id: 16, name: PermissionCodes.Supplier.DELETE },
    { id: 17, name: PermissionCodes.Vehicle.READ },
    { id: 18, name: PermissionCodes.Vehicle.CREATE },
    { id: 19, name: PermissionCodes.Vehicle.UPDATE },
    { id: 20, name: PermissionCodes.Vehicle.DELETE },
    { id: 21, name: PermissionCodes.Repair.READ },
    { id: 22, name: PermissionCodes.Repair.CREATE },
    { id: 23, name: PermissionCodes.Repair.UPDATE },
    { id: 24, name: PermissionCodes.Repair.DELETE },
    { id: 25, name: PermissionCodes.PurchaseOrder.READ },
    { id: 26, name: PermissionCodes.PurchaseOrder.CREATE },
    { id: 27, name: PermissionCodes.PurchaseOrder.UPDATE },
    { id: 28, name: PermissionCodes.PurchaseOrder.DELETE },
    { id: 29, name: PermissionCodes.Cart.READ },
    { id: 30, name: PermissionCodes.Cart.CREATE },
    { id: 31, name: PermissionCodes.Cart.UPDATE },
    { id: 32, name: PermissionCodes.Cart.DELETE },
  ];

  await mergeTableData('Permission', sourceData);
};
