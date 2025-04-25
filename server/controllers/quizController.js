import e from "express";
import getClaudeResponse from "../services/claudeService";

const getExplanation = async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      
      const prompt = `
      I want you to explain the topic "${topic}" in simple terms. Your response should be structured as follows:
  
      1. A clear, concise basic explanation of the topic suitable for beginners.
      2. 2-3 practical examples to illustrate the concept.
      3. 1-2 helpful analogies to make the concept more relatable.
      4. If the topic is related to programming or technical subjects, include a simple code example.
  
      Format your response as a JSON object with the following structure:
      {
        "topic": "${topic}",
        "basicExplanation": "Your explanation here...",
        "examples": ["Example 1", "Example 2", ...],
        "analogies": ["Analogy 1", "Analogy 2", ...],
        "code": "Code example if applicable, otherwise null"
      }
      `;
      
      const claudeResponse = await getClaudeResponse(prompt);
      
      // Parse the JSON response from Claude
      const explanationData = JSON.parse(claudeResponse);
      
      res.json(explanationData);
    } catch (error) {
      console.error('Error generating explanation:', error);
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  };
  
  // Controller for generating quizzes
const getQuiz = async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      
      const prompt = `
      Create a multiple-choice quiz about "${topic}" with 5 questions. Each question should have 4 possible answers with only one correct answer.
  
      Format your response as a JSON object with the following structure:
      {
        "topic": "${topic}",
        "questions": [
          {
            "question": "Question text...",
            "answers": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
            "correctAnswerIndex": 0, // Index of the correct answer (0-3)
            "explanation": "Brief explanation of why this answer is correct"
          },
          // More questions...
        ]
      }
  
      Ensure questions test understanding rather than just memorization. Include a mix of difficulty levels.
      `;
      
      const claudeResponse = await getClaudeResponse(prompt);
      
      // Parse the JSON response from Claude
      const quizData = JSON.parse(claudeResponse);
      
      res.json(quizData);
    } catch (error) {
      console.error('Error generating quiz:', error);
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  };

  export { getExplanation, getQuiz };