import { PrismaClient } from '@prisma/client';

import {
  countryProvinceTownPostDeployAsync,
  productPostDeployAsync,
  permissionPostDeployAsync,
  registrationRequestStatusPostDeployAsync,
  rolePermissionPostDeployAsync,
  rolePostDeployAsync,
} from './table-population';

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    registrationRequestStatusPostDeployAsync(),
    rolePostDeployAsync(),
    permissionPostDeployAsync(),
    countryProvinceTownPostDeployAsync(),
    productPostDeployAsync(),
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
