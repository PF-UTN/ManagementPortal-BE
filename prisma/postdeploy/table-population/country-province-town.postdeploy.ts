import { Country, Province, Town } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const populateTablesPostDeployAsync = async () => {
  const countryData: Country[] = [
    { id: 1, name: 'Argentina' },
    { id: 2, name: 'Brasil' },
    { id: 3, name: 'Chile' },
    { id: 4, name: 'Uruguay' },
  ];

  await mergeTableData('Country', countryData);

  const provinceData: Province[] = [
    { id: 1, name: 'Santa Fe', countryId: 1 },
    { id: 2, name: 'Buenos Aires', countryId: 1 },
    { id: 3, name: 'São Paulo', countryId: 2 },
    { id: 4, name: 'Rio de Janeiro', countryId: 2 },
    { id: 5, name: 'Santiago', countryId: 3 },
    { id: 6, name: 'Montevideo', countryId: 4 },
  ];

  await mergeTableData('Province', provinceData);

  const townData: Town[] = [
    { id: 1, name: 'Rosario', zipCode: '2000', provinceId: 1 },
    { id: 2, name: 'Santa Fe', zipCode: '3000', provinceId: 1 },
    { id: 3, name: 'Buenos Aires', zipCode: '1000', provinceId: 2 },
    { id: 4, name: 'Mar del Plata', zipCode: '7600', provinceId: 2 },
    { id: 5, name: 'São Paulo', zipCode: '01000', provinceId: 3 },
    { id: 6, name: 'Rio de Janeiro', zipCode: '20000', provinceId: 4 },
    { id: 7, name: 'Santiago', zipCode: '8320000', provinceId: 5 },
    { id: 8, name: 'Montevideo', zipCode: '11000', provinceId: 6 },
  ];

  await mergeTableData('Town', townData);
};