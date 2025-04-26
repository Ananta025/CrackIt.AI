import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth'; // Add mammoth for DOCX handling

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
 * Extract text from a DOCX file or buffer
 * @param {string|Buffer} input - Path to the DOCX file or DOCX buffer
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromDOCX(input) {
    try {
        let dataBuffer;
        if (Buffer.isBuffer(input)) {
            dataBuffer = input;
        } else {
            dataBuffer = await fs.readFile(input);
        }
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw error;
    }
}

/**
 * Extract text from any supported file format based on mime type
 * @param {Buffer} buffer - The file buffer
 * @param {string} mimeType - The file's mime type
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromFile(buffer, mimeType) {
    try {
        if (mimeType === 'application/pdf') {
            return await extractTextFromPDF(buffer);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return await extractTextFromDOCX(buffer);
        } else if (mimeType === 'text/plain') {
            return buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        throw error;
    }
}
