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
    { id: 103, name: 'Córdoba', countryId: 1 },
  ];

  await mergeTableData('Province', provinceData);

  const townData: Town[] = [
    { id: 101001, name: 'Rosario', zipCode: '2000', provinceId: 101 },
    { id: 101002, name: 'Santa Fe', zipCode: '3000', provinceId: 101 },
    { id: 102001, name: 'Buenos Aires', zipCode: '1000', provinceId: 102 },
    { id: 102002, name: 'Mercedes', zipCode: '6600', provinceId: 102 },
    { id: 102003, name: 'Salto', zipCode: '2741', provinceId: 102 },
    { id: 102004, name: 'Villa Ramallo', zipCode: '2914', provinceId: 102 },
    { id: 102005, name: 'Ramallo', zipCode: '2915', provinceId: 102 },
    { id: 102006, name: 'San Pedro', zipCode: '2930', provinceId: 102 },
    {
      id: 102007,
      name: 'San Nicolás de los Arroyos',
      zipCode: '2900',
      provinceId: 102,
    },
    { id: 102008, name: 'La Violeta', zipCode: '2751', provinceId: 102 },
    { id: 102009, name: 'Perez Millán', zipCode: '2933', provinceId: 102 },
    { id: 103001, name: 'Guatimozín', zipCode: '2627', provinceId: 103 },
  ];

  await mergeTableData('Town', townData);
};
