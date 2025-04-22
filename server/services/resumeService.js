import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { extractTextFromPDF } from "../utils/extractText.js";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Analyze resume text and generate improvement suggestions
 * @param {string} resumeText - Extracted text from resume
 * @returns {Promise<Object>} - Structured analysis results
 */
export async function analyzeResume(resumeText) {
  try {
    const prompt = `
    You are an expert resume reviewer and ATS specialist. Please analyze the following resume and provide 
    detailed feedback in JSON format with the following categories:

    1. ATS Compatibility: Analyze how well the resume would pass through Applicant Tracking Systems
    2. Buzzwords: Identify missing industry keywords and suggest relevant ones to add
    3. Structure: Review the resume structure and organization
    4. Content Analysis: Review specific sections for improvements
    5. Missing Sections: Identify any important sections that should be added
    6. Overall Suggestions: Provide 3-5 key improvements

    The response should be ONLY valid JSON in the following format:
    {
      "atsCompatibility": {
        "score": (number between 1-10),
        "issues": [],
        "suggestions": []
      },
      "buzzwords": {
        "present": [],
        "missing": [],
        "suggestions": []
      },
      "structure": {
        "assessment": "",
        "suggestions": []
      },
      "contentAnalysis": {
        "strengths": [],
        "weaknesses": [],
        "suggestions": []
      },
      "missingSections": [],
      "overallSuggestions": []
    }

    Resume text:
    ${resumeText}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const responseText = response.text;
    
    // Extract JSON from response - handling potential text before/after the JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
}

/**
 * Process a resume file and provide analysis
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<Object>} - Analysis results
 */
export async function processResumeFile(pdfBuffer) {
  try {
    const resumeText = await extractTextFromPDF(pdfBuffer);
    return await analyzeResume(resumeText);
  } catch (error) {
    console.error('Error processing resume:', error);
    throw new Error('Failed to process resume');
  }
}