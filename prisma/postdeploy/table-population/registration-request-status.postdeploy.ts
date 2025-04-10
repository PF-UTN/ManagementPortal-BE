import { RegistrationRequestStatus } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const registrationRequestStatusPostDeployAsync = async () => {
  const sourceData: RegistrationRequestStatus[] = [
    { id: 1, code: 'Pending' },
    { id: 2, code: 'Approved' },
    { id: 3, code: 'Rejected' },
  ];

  await mergeTableData('RegistrationRequestStatus', sourceData);
};
