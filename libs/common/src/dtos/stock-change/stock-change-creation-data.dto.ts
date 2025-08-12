import { StockChangedField, StockChangeTypeIds } from '@mp/common/constants';

export class StockChangeCreationDataDto {
  productId: number;
  changeTypeId: StockChangeTypeIds;
  changedField: StockChangedField;
  previousValue: number;
  newValue: number;
  reason?: string;
}
