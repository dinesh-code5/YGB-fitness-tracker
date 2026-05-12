const { GoogleGenerativeAI } = require("@google/generative-ai");
const DietPlan = require('../models/DietPlan');

/**
 * @desc    Generate personalized Indian diet plan using Gemini AI
 * @route   POST /api/diet/generate-ai
 * @access  Private
 */
const generateAiDiet = async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal, dietType, additionalInfo } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        message: "Gemini API Key is missing in backend/.env. Please add GEMINI_API_KEY=your_key_here" 
      });
    }

    // Initialize AI model inside the request to ensure API key is loaded
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Attempting Gemini AI generation with model: gemini-pro");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert Indian nutritionist. Generate a highly personalized daily diet plan for:
Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Gender: ${gender}
Activity: ${activityLevel}, Goal: ${goal}, Diet: ${dietType}
Preferences: ${additionalInfo || "None"}

RESPOND WITH ONLY VALID JSON (no markdown, no backticks):
{
  "targetCalories": 2500,
  "macros": {"protein": 150, "carbs": 280, "fats": 80},
  "bmr": 1800,
  "tdee": 2500,
  "waterIntake": 3.5,
  "mealPlan": {
    "breakfast": {
      "label": "Breakfast",
      "options": ["2 roti + 1 bowl dal + 1 bowl sabzi", "Dosa + sambar + chutney"],
      "macros": {"calories": 500, "protein": 20, "carbs": 60, "fats": 15}
    },
    "lunch": {
      "label": "Lunch",
      "options": ["2 roti + 150g chicken + dal + sabzi", "Biryani (1 bowl) + raita"],
      "macros": {"calories": 700, "protein": 35, "carbs": 80, "fats": 20}
    },
    "snack": {
      "label": "Evening Snack",
      "options": ["1 glass milk + 2 biscuits", "Fruit + handful peanuts"],
      "macros": {"calories": 300, "protein": 12, "carbs": 40, "fats": 10}
    },
    "dinner": {
      "label": "Dinner",
      "options": ["2 roti + paneer curry + salad", "Khichdi + yogurt"],
      "macros": {"calories": 600, "protein": 25, "carbs": 70, "fats": 15}
    }
  },
  "proteinTips": ["Eat protein at every meal", "Paneer and dal are your friends"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log("Gemini Response:", text.substring(0, 200)); 
    
    let jsonStr = text;
    if (text.includes('```json')) {
      const parts = text.split('```json');
      if (parts.length > 1) {
        jsonStr = parts[1].split('```')[0].trim();
      }
    } else if (text.includes('```')) {
      const parts = text.split('```');
      if (parts.length > 1) {
        jsonStr = parts[1].split('```')[0].trim();
      }
    }
    
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found in response");
    }
    
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    
    let dietData;
    try {
      dietData = JSON.parse(jsonStr);
    } catch (parseErr) {
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
