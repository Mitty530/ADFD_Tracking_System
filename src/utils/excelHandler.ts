import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  data: any[][];
  headers: string[];
  rowCount: number;
  columnCount: number;
}

export interface ExcelFile {
  fileName: string;
  sheets: ExcelSheet[];
  sheetNames: string[];
  totalSheets: number;
}

export class ExcelHandler {
  /**
   * Read Excel file and extract all sheets
   */
  static async readExcelFile(file: File): Promise<ExcelFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheets: ExcelSheet[] = [];
          
          // Process each sheet
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert sheet to JSON format
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              defval: '' 
            }) as any[][];
            
            // Extract headers (first row)
            const headers = jsonData.length > 0 ? jsonData[0] as string[] : [];
            
            // Get sheet range info
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            
            const sheetInfo: ExcelSheet = {
              name: sheetName,
              data: jsonData,
              headers,
              rowCount: jsonData.length,
              columnCount: headers.length
            };
            
            sheets.push(sheetInfo);
          });
          
          const result: ExcelFile = {
            fileName: file.name,
            sheets,
            sheetNames: workbook.SheetNames,
            totalSheets: workbook.SheetNames.length
          };
          
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to read Excel file: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Get specific sheet data by name
   */
  static getSheetByName(excelFile: ExcelFile, sheetName: string): ExcelSheet | null {
    return excelFile.sheets.find(sheet => sheet.name === sheetName) || null;
  }

  /**
   * Get specific sheet data by index
   */
  static getSheetByIndex(excelFile: ExcelFile, index: number): ExcelSheet | null {
    return excelFile.sheets[index] || null;
  }

  /**
   * Convert sheet data to objects with headers as keys
   */
  static sheetToObjects(sheet: ExcelSheet): Record<string, any>[] {
    if (sheet.data.length <= 1) return [];
    
    const [headers, ...rows] = sheet.data;
    
    return rows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  /**
   * Search for data across all sheets
   */
  static searchInAllSheets(excelFile: ExcelFile, searchTerm: string): {
    sheetName: string;
    rowIndex: number;
    columnIndex: number;
    value: any;
  }[] {
    const results: {
      sheetName: string;
      rowIndex: number;
      columnIndex: number;
      value: any;
    }[] = [];

    excelFile.sheets.forEach(sheet => {
      sheet.data.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              sheetName: sheet.name,
              rowIndex,
              columnIndex,
              value: cell
            });
          }
        });
      });
    });

    return results;
  }

  /**
   * Export data to Excel with multiple sheets
   */
  static exportToExcel(data: { sheetName: string; data: any[] }[], fileName: string): void {
    const workbook = XLSX.utils.book_new();

    data.forEach(({ sheetName, data: sheetData }) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Validate Excel file format
   */
  static isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
      'text/csv' // .csv
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.xlsm', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
  }

  /**
   * Get file info without reading full content
   */
  static async getExcelFileInfo(file: File): Promise<{
    fileName: string;
    fileSize: string;
    sheetNames: string[];
    totalSheets: number;
  }> {
    const excelFile = await this.readExcelFile(file);
    
    return {
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      sheetNames: excelFile.sheetNames,
      totalSheets: excelFile.totalSheets
    };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
