import * as XLSX from 'xlsx';

export async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  try {
    // 1. PDF Handling (Dynamic Import to prevent server crashes)
       // 1. PDF Handling (Dynamic Import to prevent server crashes)
    if (fileType === 'application/pdf') {
      const pdfModule: any = await import('pdf-parse'); 
      
      // pdf-parse has weird exports. This checks if it's 'default' or just the module itself.
      const parsePdf = pdfModule.default || pdfModule;
      
      // @ts-ignore - We ignore TS here because pdf-parse types are notoriously messy
      const pdfData = await parsePdf(buffer);
      
      return pdfData.text;
    }

    // 2. Excel Handling
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        fileType === 'application/vnd.ms-excel') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        text += XLSX.utils.sheet_to_csv(worksheet) + '\n';
      });
      return text;
    }

    // 3. Text/CSV Handling
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      return buffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Failed to extract text from file');
  }
}