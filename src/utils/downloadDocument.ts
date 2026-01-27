import html2canvas from 'html2canvas';

/**
 * Download a React component as a PNG image
 */
export async function downloadAsPng(
  element: HTMLElement,
  filename: string = 'document.png'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}

/**
 * Download a React component as a PDF
 * Uses browser print functionality for simplicity
 */
export function downloadAsPdf(
  element: HTMLElement,
  filename: string = 'document.pdf'
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 0; }
            @page { size: auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(bookingId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const shortId = bookingId.slice(0, 6).toUpperCase();
  return `INV-${year}${month}-${shortId}`;
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(bookingId: string): string {
  const shortId = bookingId.slice(0, 8).toUpperCase();
  return `CERT-${shortId}`;
}
