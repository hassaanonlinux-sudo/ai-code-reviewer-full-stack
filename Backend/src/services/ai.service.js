require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY });

async function generateContent(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      
      // 👇 Add system instructions here (camelCase works for this method)
      config: {
        systemInstruction: "You are a code reviewer assistant. Analyze code for bugs, security flaws, and performance improvements. Always reply in a concise, bulleted format.",
      },
    });

    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

module.exports = { generateContent };