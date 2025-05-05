import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { extractTextFromPDF, extractTextFromFile } from "../utils/extractText.js";
import config from "../config/config.js";
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
        "score": (number between 1-100),
        "issues": [],
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
 * Analyze resume with structured section extraction and feedback
 * @param {string} resumeText - Extracted text from resume
 * @returns {Promise<Object>} - Structured section-by-section analysis
 */
export async function analyzeResumeStructured(resumeText) {
  try {
    const prompt = `
    You are an expert resume reviewer and ATS specialist. Analyze the following resume and provide 
    a detailed structured analysis. Extract and analyze each section separately:

    1. Extract and analyze the header (name, contact info)
    2. Extract and analyze the summary/objective
    3. Extract and analyze the education section
    4. Extract and analyze the experience section
    5. Extract and analyze the skills section
    6. Extract and analyze any projects section
    7. Extract and analyze any certifications section
    8. Provide an overall ATS compatibility score (0-100)

    For each section, provide specific improvement suggestions and rewritten examples where applicable.
    
    Return ONLY valid JSON in this exact format:
    {
      "header": {
        "extracted": "",
        "analysis": "",
        "suggestions": []
      },
      "summary": {
        "extracted": "",
        "analysis": "",
        "suggestions": [],
        "improved": ""
      },
      "education": {
        "extracted": [],
        "analysis": "",
        "suggestions": []
      },
      "experience": {
        "extracted": [],
        "analysis": "",
        "suggestions": [],
        "improved": []
      },
      "skills": {
        "extracted": [],
        "missing": [],
        "suggestions": []
      },
      "projects": {
        "extracted": [],
        "analysis": "",
        "suggestions": []
      },
      "certifications": {
        "extracted": [],
        "analysis": "",
        "suggestions": []
      },
      "atsCompatibility": {
        "score": 0,
        "issues": [],
        "suggestions": []
      },
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
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing resume structure:', error);
    throw new Error('Failed to analyze resume structure: ' + error.message);
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

/**
 * Process a resume file and provide detailed structured analysis
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File mime type
 * @returns {Promise<Object>} - Detailed analysis results
 */
export async function processResumeFileStructured(fileBuffer, mimeType) {
  try {
    const resumeText = await extractTextFromFile(fileBuffer, mimeType);
    return await analyzeResumeStructured(resumeText);
  } catch (error) {
    console.error('Error processing resume:', error);
    throw new Error('Failed to process resume: ' + error.message);
  }
}

/**
 * Generate content for a specific resume section
 * @param {string} sectionType - Type of section (summary, experience, etc)
 * @param {Object} userInput - User input for the section
 * @returns {Promise<string|Object>} - Generated content
 */
export async function generateResumeSection(sectionType, userInput) {
  try {
    let prompt = '';
    
    switch(sectionType) {
      case 'summary':
        prompt = `
        Create a powerful professional summary for a resume based on this information:
        - Role/Industry: ${userInput.role || 'Not specified'}
        - Years of experience: ${userInput.experience || 'Not specified'}
        - Key skills: ${userInput.skills || 'Not specified'}
        - Career highlights: ${userInput.highlights || 'Not specified'}
        
        Generate ONLY ONE concise, impactful 2-3 sentence professional summary paragraph. 
        Use active voice and powerful language.
        Do NOT provide multiple options or explanations.
        Do NOT include placeholder text like [mention specific skill].
        Do NOT include headings, bullet points, or formatting instructions.
        Return ONLY the final, polished summary text that can be directly placed in a resume.
        `;
        break;
        
      case 'experience':
        prompt = `
        Create compelling bullet points for this work experience:
        - Job Title: ${userInput.title || 'Not specified'}
        - Company: ${userInput.company || 'Not specified'}
        - Duration: ${userInput.duration || 'Not specified'}
        - Responsibilities: ${userInput.responsibilities || 'Not specified'}
        - Achievements: ${userInput.achievements || 'Not specified'}
        
        Create 3-5 achievement-focused bullet points using strong action verbs.
        Each bullet point must:
        1. Start with a powerful action verb (e.g., Developed, Implemented, Reduced)
        2. Include specific, concrete details - NO placeholder text
        3. Contain precise metrics (percentages, numbers, dollar amounts)
        4. Show clear impact and results for the organization/clients
        
        Format as a JSON array of strings.
        Here's an example of excellent bullet points:
        [
          "Developed and launched 15 responsive websites for small businesses, resulting in an average 30% increase in client lead generation within the first quarter.",
          "Reduced website loading times by 45% through optimization techniques including image compression and code minification, improving user experience and SEO rankings.",
          "Implemented secure e-commerce solutions for 5 clients, processing over $250,000 in transactions annually with a 99.9% uptime."
        ]
        `;
        break;
        
      case 'description':
        // Adding support for description section type (similar to experience)
        prompt = `
        Create compelling bullet points for this position:
        - Job Title: ${userInput.title || 'Not specified'}
        - Company: ${userInput.company || 'Not specified'}
        - Duration: ${userInput.duration || 'Not specified'}
        
        Create EXACTLY 2-3 achievement-focused bullet points using strong action verbs.
        Keep each bullet point concise and under 15 words when possible.
        Each bullet point should:
        1. Start with a strong action verb
        2. Include a specific achievement with metrics
        3. Be direct and to the point
        
        Do NOT include any explanatory text, introductions, or comments.
        Do NOT use placeholders like [Project or Task].
        Return ONLY the bullet points, one per line, with no additional text.
        `;
        break;
        
      case 'skills':
        prompt = `
        Based on this job role and experience, suggest relevant skills to include on a resume:
        - Job Title/Target Role: ${userInput.role || 'Not specified'}
        - Industry: ${userInput.industry || 'Not specified'}
        - Experience level: ${userInput.level || 'Not specified'}
        - Current skills: ${userInput.currentSkills || 'Not specified'}
        
        Generate a focused list of the most relevant skills for this role - maximum 10 skills total.
        Include 5-7 technical skills and 3-5 soft skills most important for this position.
        Prioritize skills that would help with ATS systems.
        Format as a JSON array of strings.
        Limit the response to ONLY the most important skills, no more than 10 total.
        `;
        break;
        
      default:
        throw new Error(`Unsupported section type: ${sectionType}`);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const responseText = response.text;
    
    // Try to parse as JSON if it's an array response
    if (sectionType === 'experience' || sectionType === 'skills') {
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Could not parse as JSON, returning text');
      }
    }
    
    return responseText;
  } catch (error) {
    console.error(`Error generating ${sectionType}:`, error);
    throw new Error(`Failed to generate ${sectionType}: ${error.message}`);
  }
}