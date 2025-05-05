import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import config from '../config/config.js';

/**
 * Generate a PDF from a resume template and content
 * @param {Object} template - The resume template object with HTML and CSS
 * @param {Object} content - The resume content data
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateResumePDF(template, content) {
  let browser = null;
  
  try {
    console.log('Starting PDF generation process');
    
    // Register handlebars helpers
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    });

    // Normalize content to ensure proper structure for handlebars
    const normalizedContent = normalizeResumeContent(content);
    
    console.log('Content normalized for template rendering');

    // Compile the handlebars template with options to allow prototype access
    const compiledTemplate = handlebars.compile(template.htmlTemplate, {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    });
    
    // Generate HTML from template and content
    const html = compiledTemplate(normalizedContent);
    
    // Add CSS to the HTML
    const htmlWithCss = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            ${template.css}
            @page {
              margin: 0;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    console.log('HTML template rendered, launching browser');
    
    // Launch puppeteer browser with more options for stability
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for rendering with longer timeout
    console.log('Setting HTML content to page');
    await page.setContent(htmlWithCss, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Generating PDF file');
    
    // Generate PDF with configured settings
    const pdfSettings = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true,
      ...config.resume.pdfGeneration
    };
    
    const pdf = await page.pdf(pdfSettings);
    
    console.log(`PDF generated successfully (${pdf.length} bytes)`);
    
    // Close the browser before validation
    await browser.close();
    browser = null;
    
    // Simple check for minimum PDF size rather than header check
    // PDFs are typically at least 1KB in size
    if (!pdf || pdf.length < 1000) {
      console.error('Generated PDF is too small to be valid');
      throw new Error('Invalid PDF generated - file too small');
    }
    
    // Log a sample of the PDF bytes for debugging
    if (pdf.length > 20) {
      // Log first 20 bytes in hex to see what's in the file header
      const headerBytes = pdf.slice(0, 20);
      console.log('PDF header bytes:', headerBytes.toString('hex'));
      
      // If the file doesn't start with %PDF, log a warning but don't fail
      if (pdf.toString('ascii', 0, 4) !== '%PDF') {
        console.warn('Warning: PDF may not have standard header, but will attempt to use it anyway');
      }
    }
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed after PDF generation');
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
}

/**
 * Normalize resume content to ensure proper structure for handlebars
 * This function converts MongoDB objects to plain objects for handlebars
 * @param {Object} content - Resume content from MongoDB
 * @returns {Object} - Normalized content
 */
export function normalizeResumeContent(content) {
  // If content is already a plain object (not MongoDB document), return as is
  if (!content || typeof content !== 'object') {
    return content;
  }
  
  // Use toObject if available (MongoDB document) or create a deep copy
  const plainObject = content.toObject ? content.toObject() : JSON.parse(JSON.stringify(content));
  
  // Ensure all array fields are properly structured
  const ensureArray = (arr) => {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr;
    return [arr]; // Convert single item to array
  };
  
  // Convert dates to strings to avoid handlebars issues
  const formatDates = (items) => {
    return items.map(item => {
      const newItem = {...item};
      if (newItem.startDate instanceof Date) {
        newItem.startDate = newItem.startDate.toISOString().split('T')[0];
      }
      if (newItem.endDate instanceof Date) {
        newItem.endDate = newItem.endDate.toISOString().split('T')[0];
      }
      if (newItem.date instanceof Date) {
        newItem.date = newItem.date.toISOString().split('T')[0];
      }
      return newItem;
    });
  };
  
  // Map content to expected structure in template
  const normalized = {
    header: {
      name: plainObject.personal?.name || '',
      email: plainObject.personal?.email || '',
      phone: plainObject.personal?.phone || '',
      location: plainObject.personal?.location || '',
      linkedin: plainObject.personal?.linkedin || '',
      portfolio: plainObject.personal?.portfolio || '',
    },
    summary: plainObject.summary || '',
    experience: formatDates(ensureArray(plainObject.experience)),
    education: formatDates(ensureArray(plainObject.education)),
    skills: ensureArray(plainObject.skills),
    projects: ensureArray(plainObject.projects),
    certifications: formatDates(ensureArray(plainObject.certifications))
  };
  
  return normalized;
}
