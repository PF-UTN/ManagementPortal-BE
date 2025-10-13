import { mockDeep } from 'jest-mock-extended';

import { DOG_URL } from '@mp/common/constants';
import { OrderDetailsDto } from '@mp/common/dtos';

import { orderStatusChangeReport } from './order-status-change.report';

describe('orderStatusChangeReport', () => {
  it('should generate HTML with correct client name, order id and new status', () => {
    // Arrange
    const orderMock = mockDeep<OrderDetailsDto>();
    orderMock.id = 123;
    orderMock.client.companyName = 'Empresa Test';
    const newStatus = 'Enviado';

    // Act
    const html = orderStatusChangeReport(orderMock, newStatus);

    // Assert
    expect(html).toContain('Empresa Test');
    expect(html).toContain('#123');
    expect(html).toContain('Enviado');
    expect(html).toContain(DOG_URL);
    expect(html).toContain('<html>');
    expect(html).toContain('<div class="estado">Enviado</div>');
  });

  it('should include the correct logo URL', () => {
    // Arrange
    const orderMock = mockDeep<OrderDetailsDto>();
    orderMock.id = 1;
    orderMock.client.companyName = 'Test';
    const newStatus = 'Preparado';

    // Act
    const html = orderStatusChangeReport(orderMock, newStatus);

    // Assert
    expect(html).toContain(`src=${DOG_URL}`);
    expect(html).toContain('alt="Logo"');
  });

  it('should include the automatic message in the footer', () => {
    // Arrange
    const orderMock = mockDeep<OrderDetailsDto>();
    orderMock.id = 1;
    orderMock.client.companyName = 'Test';
    const newStatus = 'Finalizado';

    // Act
    const html = orderStatusChangeReport(orderMock, newStatus);

    // Assert
    expect(html).toContain(
      'Este es un mensaje automático, no respondas este correo.',
    );
  });
});
