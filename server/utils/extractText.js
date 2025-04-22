import { promises as fs } from 'fs';
import pdf from 'pdf-parse';

/**
 * Extract text from a PDF file or buffer
 * @param {string|Buffer} input - Path to the PDF file or PDF buffer
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromPDF(input) {
    try {
        // Check if input is a buffer or a file path
        let dataBuffer;
        if (Buffer.isBuffer(input)) {
            dataBuffer = input;
        } else {
            // Read the PDF file as buffer if input is a file path
            dataBuffer = await fs.readFile(input);
        }
        // Use pdf-parse to extract text
        const data = await pdf(dataBuffer);
        // Return the text content
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
} 

/**
 * Extract text from PDF with additional options
 * @param {string|Buffer} input - Path to the PDF file or PDF buffer
 * @param {Object} options - Options for pdf-parse
 * @returns {Promise<Object>} - The parsed PDF data
 */
export async function extractPDFWithOptions(input, options = {}) {
    try {
        let dataBuffer;
        if (Buffer.isBuffer(input)) {
            dataBuffer = input;
        } else {
            dataBuffer = await fs.readFile(input);
        }
        const data = await pdf(dataBuffer, options);
        return data;
    } catch (error) {
        console.error('Error processing PDF with options:', error);
        throw error;
    }
}
