import * as XLSX from 'xlsx';

export class ExcelExportHelper {
  /**
   * Converts an array of objects to an XLSX file buffer.
   * @param data Array of objects to export
   * @param sheetName Optional sheet name
   * @returns Buffer containing the XLSX file
   */
  static exportToExcelBuffer<T extends object>(
    data: T[],
    sheetName = 'Sheet1',
  ): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
