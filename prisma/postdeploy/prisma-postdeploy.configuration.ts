import { PrismaClient } from '@prisma/client';
import { registrationRequestStatusPostDeployAsync } from './table-population/registration-request-status.postdeploy';

const prisma = new PrismaClient();

async function main() {
  await registrationRequestStatusPostDeployAsync();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });