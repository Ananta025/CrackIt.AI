// import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Extract text content from various file formats
 * @param {Object} file - File object from multer middleware
 * @returns {Promise<string>} - Extracted text content
 */
async function extractText(file) {
    try {
        const filePath = file.path;
        const fileExtension = path.extname(file.originalname).toLowerCase();

        switch (fileExtension) {
            case '.pdf':
                return await extractFromPDF(filePath);
            case '.docx':
                return await extractFromDOCX(filePath);
            case '.txt':
                return await extractFromTXT(filePath);
            default:
                throw new Error(`Unsupported file format: ${fileExtension}`);
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
}

/**
 * Extract text from PDF files
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // Dynamically import pdf-parse to avoid loading test files at startup
        const pdfParse = await import('pdf-parse');
        const data = await pdfParse.default(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`PDF extraction error: ${error.message}`);
    }
}

/**
 * Extract text from DOCX files
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new Error(`DOCX extraction error: ${error.message}`);
    }
}

/**
 * Extract text from plain text files
 * @param {string} filePath - Path to the text file
 * @returns {Promise<string>} - File content
 */
async function extractFromTXT(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        throw new Error(`Text file reading error: ${error.message}`);
    }
}

export default extractText;
