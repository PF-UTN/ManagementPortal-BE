import { TaxCategory } from '@prisma/client';

import { mergeTableData } from './generate-merge-data.script';

export const taxCategoryPostDeployAsync = async () => {
  const sourceData: TaxCategory[] = [
    {
      id: 1,
      name: 'Responsable Inscripto',
      description:
        'Sujeto inscripto en el régimen general del IVA, debe emitir facturas tipo A y presentar declaraciones juradas periódicas.',
    },
    {
      id: 2,
      name: 'Exento',
      description:
        'Contribuyente exento del impuesto al valor agregado (IVA) según normativa vigente. No discrimina IVA en sus facturas.',
    },
    {
      id: 3,
      name: 'Monotributo',
      description:
        'Pequeño contribuyente adherido al régimen simplificado, que abona un monto fijo mensual que incluye IVA, Ganancias y obra social.',
    },
    {
      id: 4,
      name: 'Consumidor Final',
      description:
        'Persona que adquiere bienes o servicios para uso personal, sin fines de reventa. No está obligada a inscribirse en impuestos.',
    },
  ];

  await mergeTableData('TaxCategory', sourceData);
};
