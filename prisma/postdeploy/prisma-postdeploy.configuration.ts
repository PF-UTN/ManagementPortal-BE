import { PrismaClient } from '@prisma/client';

import {
  countryProvinceTownPostDeployAsync,
  permissionPostDeployAsync,
  registrationRequestStatusPostDeployAsync,
  rolePermissionPostDeployAsync,
  rolePostDeployAsync,
  taxCategoryPostDeployAsync,
  stockChangeTypePostDeployAsync,
  purchaseOrderStatusPostDeployAsync,
  shipmentStatusPostDeployAsync,
  paymentStatusPostDeployAsync,
  deliveryMethodPostDeployAsync,
  orderStatusPostDeployAsync,
  paymentTypePostDeployAsync,
} from './table-population';

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    registrationRequestStatusPostDeployAsync(),
    rolePostDeployAsync(),
    permissionPostDeployAsync(),
    countryProvinceTownPostDeployAsync(),
    taxCategoryPostDeployAsync(),
    stockChangeTypePostDeployAsync(),
    purchaseOrderStatusPostDeployAsync(),
    orderStatusPostDeployAsync(),
    deliveryMethodPostDeployAsync(),
    paymentTypePostDeployAsync(),
    shipmentStatusPostDeployAsync(),
    paymentStatusPostDeployAsync(),
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
