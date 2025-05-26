import { Country, Province, Town } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const countryProvinceTownPostDeployAsync = async () => {
  const countryData: Country[] = [
    { id: 1, name: 'Argentina' },
    { id: 2, name: 'Brasil' },
    { id: 3, name: 'Chile' },
    { id: 4, name: 'Uruguay' },
  ];

  await mergeTableData('Country', countryData);

  const provinceData: Province[] = [
    { id: 101, name: 'Santa Fe', countryId: 1 },
    { id: 102, name: 'Buenos Aires', countryId: 1 },
    { id: 201, name: 'São Paulo', countryId: 2 },
    { id: 202, name: 'Rio de Janeiro', countryId: 2 },
    { id: 301, name: 'Santiago', countryId: 3 },
    { id: 401, name: 'Montevideo', countryId: 4 },
  ];

  await mergeTableData('Province', provinceData);

  const townData: Town[] = [
    { id: 101001, name: 'Rosario', zipCode: '2000', provinceId: 101 },
    { id: 101002, name: 'Santa Fe', zipCode: '3000', provinceId: 101 },
    { id: 102001, name: 'Buenos Aires', zipCode: '1000', provinceId: 102 },
    { id: 102002, name: 'Mar del Plata', zipCode: '7600', provinceId: 102 },
    { id: 201001, name: 'São Paulo', zipCode: '01000', provinceId: 201 },
    { id: 202001, name: 'Rio de Janeiro', zipCode: '20000', provinceId: 202 },
    { id: 301001, name: 'Santiago', zipCode: '8320000', provinceId: 301 },
    { id: 401001, name: 'Montevideo', zipCode: '11000', provinceId: 401 },
  ];

  await mergeTableData('Town', townData);
};
