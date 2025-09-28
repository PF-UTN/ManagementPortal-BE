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
} from './table-population';
import { deliveryMethodPostDeployAsync } from './table-population/delivery-method.postdeploy';
import { orderStatusPostDeployAsync } from './table-population/order-status.postdeploy';
import { paymentTypePostDeployAsync } from './table-population/payment-type.postdeploy';

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
