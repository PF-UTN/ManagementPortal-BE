import { Permission } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';
import { PermissionCodes } from '../../../libs/common/src/constants/permission-codes.constants';

export const permissionPostDeployAsync = async () => {
  const sourceData: Permission[] = [
    { id: 1, name: PermissionCodes.RegistrationRequest.READ },
    { id: 2, name: PermissionCodes.RegistrationRequest.CREATE },
    { id: 3, name: PermissionCodes.RegistrationRequest.UPDATE },
    { id: 4, name: PermissionCodes.RegistrationRequest.DELETE },
  ];

  await mergeTableData('Permission', sourceData);
};
