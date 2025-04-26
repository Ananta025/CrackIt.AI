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
  try {
    // Register handlebars helpers if needed
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    });

    // Compile the handlebars template
    const compiledTemplate = handlebars.compile(template.htmlTemplate);
    
    // Generate HTML from template and content
    const html = compiledTemplate(content);
    
    // Add CSS to the HTML
    const htmlWithCss = `
      <style>
        ${template.css}
      </style>
      ${html}
    `;
    
    // Launch puppeteer browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for rendering
    await page.setContent(htmlWithCss, { 
      waitUntil: 'networkidle0' 
    });
    
    // Generate PDF with configured settings
    const pdfSettings = config.resume.pdfGeneration;
    const pdf = await page.pdf(pdfSettings);
    
    await browser.close();
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}
