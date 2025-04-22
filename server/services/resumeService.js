import { GoogleGenAI } from "@google/genai";
import { promises as fs } from 'fs';
import path from 'path';

export default class ResumeService {
    constructor(apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
        this.model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Analyze resume and extract key information
     * @param {string} resumeText - The text content of the resume
     * @returns {Promise<Object>} - Structured resume data
     */
    async analyzeResume(resumeText) {
        try {
            const prompt = `Analyze the following resume and extract key information using this JSON schema:
            
            ResumeData = {
                'personalInfo': {
                    'name': string,
                    'email': string,
                    'phone': string,
                    'location': string
                },
                'skills': Array<string>,
                'workExperience': Array<{
                    'company': string,
                    'position': string,
                    'duration': string,
                    'description': Array<string>
                }>,
                'education': Array<{
                    'institution': string,
                    'degree': string,
                    'year': string
                }>
            }
            
            Resume content:
            ${resumeText}
            
            Return only valid JSON without explanations.`;

            const response = await this.model.generateContent(prompt);
            const result = response.response.text();
            return JSON.parse(result);
        } catch (error) {
            console.error("Error analyzing resume:", error);
            throw error;
        }
    }

    /**
     * Generate improvement suggestions for a resume
     * @param {string} resumeText - The text content of the resume
     * @returns {Promise<Array<string>>} - List of suggestions
     */
    async getSuggestions(resumeText) {
        try {
            const prompt = `Review the following resume and provide 5 specific improvement suggestions:
            
            ${resumeText}
            
            Return an array of suggestions in JSON format.`;

            const response = await this.model.generateContent(prompt);
            const result = response.response.text();
            return JSON.parse(result);
        } catch (error) {
            console.error("Error getting resume suggestions:", error);
            throw error;
        }
    }

    /**
     * Match resume with job description
     * @param {string} resumeText - The text content of the resume
     * @param {string} jobDescription - The job description
     * @returns {Promise<Object>} - Match analysis
     */
    async matchWithJob(resumeText, jobDescription) {
        try {
            const prompt = `Compare this resume with the job description and analyze the match:
            
            Resume:
            ${resumeText}
            
            Job Description:
            ${jobDescription}
            
            Return JSON with:
            1. Match percentage (0-100)
            2. List of matching skills
            3. List of missing skills
            4. Overall assessment`;

            const response = await this.model.generateContent(prompt);
            const result = response.response.text();
            return JSON.parse(result);
        } catch (error) {
            console.error("Error matching resume with job:", error);
            throw error;
        }
    }
}
