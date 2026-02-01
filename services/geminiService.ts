
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBreakdown = async (description: string, lang: Language): Promise<GeminiResponse> => {
  const languageNames: Record<Language, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is in a roadside emergency in India. The description provided is: "${description}". 
      1. Categorize the issue (e.g. Tyre, Battery, Engine, Accident, General).
      2. Determine severity.
      3. Suggest a primary action in ${languageNames[lang]} language only. Do not provide translation in other languages.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING, description: "Short problem category" },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            suggestedAction: { type: Type.STRING, description: "Advice for the user in the specified language" },
          },
          required: ["issueType", "severity", "suggestedAction"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as GeminiResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    const fallbacks: Record<Language, string> = {
      en: "Stay in a safe place until help arrives.",
      hi: "मदद आने तक सुरक्षित स्थान पर रहें।",
      mr: "मदत येईपर्यंत सुरक्षित ठिकाणी राहा."
    };
    return {
      issueType: description || "General Help",
      severity: "High",
      suggestedAction: fallbacks[lang]
    };
  }
};
