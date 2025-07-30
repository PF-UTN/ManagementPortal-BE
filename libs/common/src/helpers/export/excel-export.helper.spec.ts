import * as XLSX from 'xlsx';

import { ExcelExportHelper } from './excel-export.helper';

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
});
