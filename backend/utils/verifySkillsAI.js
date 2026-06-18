const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in your environment configuration");
}

// v2.8.0 Modern initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function verifySkillsAI(resumeText, certTexts) {
  try {
    const prompt = `
You are an expert technical recruiter.

Tasks:
1. Extract technical skills from the resume text.
2. Cross-reference them semantically with certificate texts.
3. Treat synonyms as matches (e.g. "ReactJS" supports "React").
4. Generate an overall score out of 100.
5. Determine confidence level:
   High >= 85
   Medium 50-84
   Low < 50

Return your response in strict, raw JSON formatting using this schema:
{
  "verifiedSkills": [],
  "unverifiedSkills": [],
  "score": 0,
  "confidence": ""
}

Resume Content:
${resumeText}

Certificate Content Entries:
${certTexts.join("\n\n---\n\n")}
`;

    // modern SDK v2.x.x syntax block
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini Engine SDK v2.8.0 Error:", err);
    return {
      verifiedSkills: [],
      unverifiedSkills: [],
      score: 0,
      confidence: "Failed",
    };
  }
}

module.exports = { verifySkillsAI };