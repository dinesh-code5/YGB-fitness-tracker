const { GoogleGenAI } = require("@google/genai");
const DietPlan = require('../models/DietPlan');

/**
 * @desc    Generate personalized Indian diet plan using Gemini AI
 * @route   POST /api/diet/generate-ai
 * @access  Private
 */
const generateAiDiet = async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal, dietType, additionalInfo } = req.body;
    
    // Initialize AI model inside the request to ensure API key is loaded
    const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `You are an expert Indian nutritionist. Generate a highly personalized daily diet plan for:
Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Gender: ${gender}
Activity: ${activityLevel}, Goal: ${goal}, Diet: ${dietType}
Preferences: ${additionalInfo || "None"}

Return a JSON object with this exact structure:
{
  "targetCalories": number,
  "macros": {"protein": number, "carbs": number, "fats": number},
  "bmr": number,
  "tdee": number,
  "waterIntake": number,
  "mealPlan": {
    "breakfast": {
      "label": "Breakfast",
      "options": ["option 1", "option 2"],
      "macros": {"calories": number, "protein": number, "carbs": number, "fats": number}
    },
    "lunch": {
      "label": "Lunch",
      "options": ["option 1", "option 2"],
      "macros": {"calories": number, "protein": number, "carbs": number, "fats": number}
    },
    "snack": {
      "label": "Evening Snack",
      "options": ["option 1", "option 2"],
      "macros": {"calories": number, "protein": number, "carbs": number, "fats": number}
    },
    "dinner": {
      "label": "Dinner",
      "options": ["option 1", "option 2"],
      "macros": {"calories": number, "protein": number, "carbs": number, "fats": number}
    }
  },
  "proteinTips": ["tip 1", "tip 2"]
}`;

    const result = await model.generateContent(prompt);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text.trim();
    
    console.log("Gemini Response Received (JSON Mode Active)"); 
    
    let dietData;
    try {
      dietData = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", text);
      throw new Error(`Invalid JSON from AI: ${parseErr.message}`);
    }

    if (!dietData.targetCalories || !dietData.macros || !dietData.mealPlan) {
      throw new Error("AI response missing required fields");
    }

    await DietPlan.upsert({
      userId: req.user.id,
      weight, height, age, gender, activityLevel, goal, dietType,
      bmr: dietData.bmr || Math.round(10*weight + 6.25*height - 5*age + (gender === 'male' ? 5 : -161)),
      tdee: dietData.tdee || Math.round((dietData.bmr || 1800) * 1.5),
      targetCalories: dietData.targetCalories,
      macros: dietData.macros,
      mealPlan: dietData.mealPlan,
      waterIntake: dietData.waterIntake || 3,
      isActive: true
    });

    res.json({
      success: true,
      dietPlan: {
        ...dietData,
        bmi: parseFloat((weight / ((height/100)**2)).toFixed(1)),
        dietType,
        goal
      }
    });

  } catch (error) {
    console.error("Gemini AI Diet Error:", error);
    res.status(500).json({ 
      message: "AI Generation failed - " + error.message, 
      error: error.message
    });
  }
};

module.exports = { generateAiDiet };
