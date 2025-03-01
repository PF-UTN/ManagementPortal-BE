import { RegistrationRequestStatus } from '@prisma/client';
import { mergeTableData } from './generate-merge-data.script';

export const registrationRequestStatusPostDeployAsync = async () => {
  const sourceData: RegistrationRequestStatus[] = [
    { id: 1, status: 'Pending' },
    { id: 2, status: 'Approved' },
    { id: 3, status: 'Rejected' },
  ];

  await mergeTableData(
    'RegistrationRequestStatus',
    sourceData,
  );
};