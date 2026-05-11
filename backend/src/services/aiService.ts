import dotenv from 'dotenv';

dotenv.config();

export const analyzeQuery = async (query: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return {
      category: 'General',
      sentiment: 'Neutral',
      recommendation: 'Please configure GEMINI_API_KEY or OPENAI_API_KEY for real-time recommendations.',
      resources: []
    };
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: apiKey || '',
    });

    const prompt = `You are an AI assistant that analyzes user search queries.
Analyze this search query: "${query}"

Provide output in strict JSON format with exactly these fields:
- category: A short string categorizing the search.
- sentiment: 'Positive', 'Negative', or 'Neutral'.
- recommendation: A helpful tip or explanation related to the query.
- resources: An array of strings representing helpful related topics or links.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });

    const content = response.text;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Gemini Error:', error);
    return null;
  }
};
