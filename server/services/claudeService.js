import axios from 'axios';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export default getClaudeResponse = async (prompt) => {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw new Error('Failed to get response from Claude');
  }
};