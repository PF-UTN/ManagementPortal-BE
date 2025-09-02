import { Stock } from '@prisma/client';

import { StockChangedField } from './stock-changed-field.constant';

export const fieldMap: Record<StockChangedField, keyof Stock> = {
  [StockChangedField.QuantityAvailable]: 'quantityAvailable',
  [StockChangedField.QuantityReserved]: 'quantityReserved',
  [StockChangedField.QuantityOrdered]: 'quantityOrdered',
};
