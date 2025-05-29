import { PrismaClient } from '@prisma/client';

import {
  countryProvinceTownPostDeployAsync,
  permissionPostDeployAsync,
  registrationRequestStatusPostDeployAsync,
  rolePermissionPostDeployAsync,
  rolePostDeployAsync,
  taxCategoryPostDeployAsync,
} from './table-population';

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    registrationRequestStatusPostDeployAsync(),
    rolePostDeployAsync(),
    permissionPostDeployAsync(),
    countryProvinceTownPostDeployAsync(),
    taxCategoryPostDeployAsync(),
  ]);

  await Promise.all([rolePermissionPostDeployAsync()]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
