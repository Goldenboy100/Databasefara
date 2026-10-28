import { GoogleGenAI } from "@google/genai";

async function generateAppIcon() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = "A professional, modern, and high-quality square app icon for a financial app named 'Golden Exchange'. The icon should feature the letters 'GE' in a bold, elegant, and slightly 3D gold serif font. The background should be a deep matte black or very dark slate with a subtle radial golden glow behind the letters. The overall aesthetic should be luxury, prestige, and trust. High resolution, 1024x1024, centered composition.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  } catch (error) {
    console.error("Error generating icon:", error);
    return null;
  }
}

export { generateAppIcon };
