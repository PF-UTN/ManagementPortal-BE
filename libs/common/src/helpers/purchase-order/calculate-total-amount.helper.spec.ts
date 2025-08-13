import { PurchaseOrderItemDto } from '@mp/common/dtos';

import { calculateTotalAmount } from './calculate-total-amount.helper';

describe('calculateTotalAmount', () => {
  it('should return the correct total amount for a list of purchase order items', () => {
    // Arrange
    const items: PurchaseOrderItemDto[] = [
      {
        productId: 1,
        quantity: 2,
        unitPrice: 10.0,
      },
      {
        productId: 2,
        quantity: 1,
        unitPrice: 5.0,
      },
    ];

    // Act
    const result = calculateTotalAmount(items);

    // Assert
    expect(result).toBe(25);
  });

  it('should return 0 for an empty list of items', () => {
    // Arrange
    const items: PurchaseOrderItemDto[] = [];

    // Act
    const result = calculateTotalAmount(items);

    // Assert
    expect(result).toBe(0);
  });
});
