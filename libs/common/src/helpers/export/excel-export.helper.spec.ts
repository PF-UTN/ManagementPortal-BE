import * as XLSX from 'xlsx';

import { ExcelExportHelper, ExcelPage } from './excel-export.helper';

describe('XlsxExportHelper', () => {
  it('exports array of objects to XLSX buffer', () => {
    // Arrange
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    // Act
    const buffer = ExcelExportHelper.exportToExcelBuffer(data, 'TestSheet');
    // Assert
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('uses default sheet name', () => {
    // Arrange
    const data = [{ foo: 'bar' }];
    // Act
    const buffer = ExcelExportHelper.exportToExcelBuffer(data);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    // Assert
    expect(workbook.SheetNames).toContain('Sheet1');
  });

  it('handles empty data arrays', () => {
    // Arrange
    const data = [{}];
    // Act
    const buffer = ExcelExportHelper.exportToExcelBuffer(data, 'EmptySheet');
    // Asserts
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets['EmptySheet'];
    const json = XLSX.utils.sheet_to_json(sheet);
    expect(json).toEqual([]);
  });

  describe('ExcelExportHelper - exportToMultipleExcelBuffers', () => {
    it('exports multiple sheets to XLSX buffer', () => {
      // Arrange
      const sheets: ExcelPage<
        { name: string; age: number } | { product: string; price: number }
      >[] = [
        { sheetName: 'Usuarios', data: [{ name: 'Alice', age: 30 }] },
        { sheetName: 'Productos', data: [{ product: 'Laptop', price: 1000 }] },
      ];

      // Act
      const buffer = ExcelExportHelper.exportToMultipleExcelBuffers(sheets);

      // Assert
      expect(buffer).toBeInstanceOf(Buffer);

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      expect(workbook.SheetNames).toContain('Usuarios');
      expect(workbook.SheetNames).toContain('Productos');
    });

    it('writes correct data into each sheet', () => {
      // Arrange
      const sheets: ExcelPage<
        { name: string; age: number } | { product: string; price: number }
      >[] = [
        { sheetName: 'Usuarios', data: [{ name: 'Alice', age: 30 }] },
        { sheetName: 'Productos', data: [{ product: 'Laptop', price: 1000 }] },
      ];

      // Act
      const buffer = ExcelExportHelper.exportToMultipleExcelBuffers(sheets);
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Assert
      const usuariosSheet = XLSX.utils.sheet_to_json(
        workbook.Sheets['Usuarios'],
      );
      const productosSheet = XLSX.utils.sheet_to_json(
        workbook.Sheets['Productos'],
      );

      expect(usuariosSheet).toEqual([{ name: 'Alice', age: 30 }]);
      expect(productosSheet).toEqual([{ product: 'Laptop', price: 1000 }]);
    });

    it('handles empty sheets correctly', () => {
      // Arrange
      const sheets: ExcelPage<
        { name: string; age: number } | { product: string; price: number }
      >[] = [{ sheetName: 'EmptySheet', data: [] }];

      // Act
      const buffer = ExcelExportHelper.exportToMultipleExcelBuffers(sheets);
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Assert
      const emptySheet = XLSX.utils.sheet_to_json(
        workbook.Sheets['EmptySheet'],
      );
      expect(emptySheet).toEqual([]);
    });
  });
});
