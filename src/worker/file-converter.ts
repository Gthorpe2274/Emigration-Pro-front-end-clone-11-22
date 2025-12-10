import { marked } from 'marked';

// Convert Markdown to HTML
export async function convertMarkdownToHTML(markdown: string): Promise<string> {
  try {
    // Configure marked options
    const html = await marked.parse(markdown, {
      gfm: true,
      breaks: true,
    });

    return wrapInHTMLDocument(html as string);
  } catch (error) {
    console.error('Markdown conversion error:', error);
    // Fallback: return markdown as plain text wrapped in HTML
    return wrapInHTMLDocument(`<pre>${escapeHtml(markdown)}</pre>`);
  }
}

// Convert PDF to HTML (basic text extraction)
// Note: This is a simplified version. For better PDF parsing, consider using pdf.js or an external service
export async function convertPDFToHTML(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // For Cloudflare Workers, we'll use a text extraction approach
    // This is a basic implementation - for production, consider using pdf.js or an external service
    const text = await extractTextFromPDF(pdfBuffer);
    
    // Format text as HTML
    const htmlContent = text
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<br>';
        // Detect headers (lines that are all caps or start with numbers)
        if (trimmed.length < 100 && (trimmed === trimmed.toUpperCase() || /^\d+\./.test(trimmed))) {
          return `<h2>${escapeHtml(trimmed)}</h2>`;
        }
        return `<p>${escapeHtml(trimmed)}</p>`;
      })
      .join('\n');

    return wrapInHTMLDocument(htmlContent);
  } catch (error) {
    console.error('PDF conversion error:', error);
    // Fallback: return a basic HTML document with error message
    return wrapInHTMLDocument(
      '<div class="error"><p>Error converting PDF. The file may be corrupted or encrypted.</p></div>'
    );
  }
}

// Extract text from PDF buffer (simplified version)
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // This is a very basic text extraction
  // In production, you'd want to use pdf.js or a proper PDF parser
  const uint8Array = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  
  // Try to extract readable text from the PDF
  // PDFs have a specific structure, but for simplicity, we'll extract readable text
  let text = '';
  const chunkSize = 1024;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    const decoded = textDecoder.decode(chunk);
    
    // Extract readable text (basic filtering)
    const readableText = decoded
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Remove non-printable chars except newlines/tabs
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (readableText.length > 10) {
      text += readableText + '\n';
    }
  }
  
  // If we couldn't extract much text, return a message
  if (text.trim().length < 50) {
    return 'PDF content could not be fully extracted. This is a basic PDF converter. For better results, consider using a dedicated PDF parsing service.';
  }
  
  return text;
}

// Wrap content in a complete HTML document
function wrapInHTMLDocument(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background-color: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #2563eb;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin-bottom: 1em;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      padding-left: 15px;
      margin-left: 0;
      color: #666;
    }
    .error {
      background-color: #fee2e2;
      border: 1px solid #dc2626;
      padding: 15px;
      border-radius: 5px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

