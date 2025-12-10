
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MealData, PainAnalysis, DailySummary, UserStats, UserProfile, AIProfileAnalysis, WorkoutLogEntry, WorkoutPlan, MenuAnalysis } from "../types";

// Initialize Gemini Client lazily to avoid crashing when API key is missing
const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const requireClient = () => {
  if (!ai) {
    throw new Error("Gemini API key missing. Set VITE_API_KEY in your .env file.");
  }
  return ai;
};

/**
 * Helper to convert File to Base64
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Helper to clean JSON string from Markdown code blocks or conversational text
 */
const cleanJSON = (text: string): string => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * Analyze User Profile (Onboarding) using Gemini 2.5 Flash
 */
export const analyzeUserProfile = async (profile: UserProfile): Promise<AIProfileAnalysis> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      daily_calories: { type: Type.INTEGER },
      daily_water_ml: { type: Type.INTEGER },
      daily_protein_g: { type: Type.INTEGER },
      daily_steps: { type: Type.INTEGER, description: "Recommended daily step count based on activity level" },
      timeline_prediction: { type: Type.STRING, description: "Estimated timeline to reach goal" },
      hydration_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
      personalized_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
      workout_intensity: { type: Type.STRING, description: "Recommended intensity (e.g., Moderate, High HIIT)" },
    },
    required: ["daily_calories", "daily_water_ml", "daily_protein_g", "daily_steps", "timeline_prediction", "hydration_warnings", "personalized_tips", "workout_intensity"],
  };

  const prompt = `
    Analyze this student profile and create a health plan.
    Profile: ${JSON.stringify(profile)}
    Return numeric targets and specific advice.
  `;

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as AIProfileAnalysis;
    }
    throw new Error("No analysis returned");
  } catch (error) {
    console.error("Profile Analysis Error:", error);
    // Fallback defaults
    return {
      daily_calories: 2200,
      daily_water_ml: 2500,
      daily_protein_g: 100,
      daily_steps: 8000,
      timeline_prediction: "3 months to see significant change",
      hydration_warnings: ["Drink water before coffee"],
      personalized_tips: ["Focus on consistency"],
      workout_intensity: "Moderate"
    };
  }
};

/**
 * Analyze Meal Image using Gemini 2.5 Flash
 */
export const analyzeMeal = async (base64Image: string, mimeType: string): Promise<MealData> => {
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      food_name: { type: Type.STRING },
      calories: { type: Type.INTEGER },
      protein: { type: Type.INTEGER },
      carbs: { type: Type.INTEGER },
      fat: { type: Type.INTEGER },
      health_rating: { type: Type.INTEGER, description: "Score from 1 to 10" },
      fat_loss_suitability: { type: Type.BOOLEAN },
      portion_change_recommendation: { type: Type.STRING, description: "e.g. 'Reduce rice by half'" },
      alternative: { type: Type.STRING, description: "A healthier alternative" },
      advice: { type: Type.STRING, description: "Short advice (1-2 sentences)" },
      is_uncertain: { type: Type.BOOLEAN, description: "True if food is unrecognizable" }
    },
    required: ["food_name", "calories", "protein", "carbs", "fat", "health_rating", "fat_loss_suitability", "portion_change_recommendation", "advice", "alternative"],
  };

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: "Analyze this meal. If unclear, set is_uncertain to true." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as MealData;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Meal Scan Error:", error);
    throw error;
  }
};

/**
 * Analyze Menu or Fridge using Gemini 2.5 Flash
 */
export const analyzeMenu = async (base64Image: string, mimeType: string, userProfile: UserProfile): Promise<MenuAnalysis> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            reason: { type: Type.STRING },
            caloriesEstimate: { type: Type.INTEGER },
            proteinEstimate: { type: Type.INTEGER }
          },
          required: ["itemName", "reason", "caloriesEstimate", "proteinEstimate"]
        }
      },
      bestOption: { type: Type.STRING },
      advice: { type: Type.STRING }
    },
    required: ["recommendations", "bestOption", "advice"]
  };

  const prompt = `
    Analyze this image (restaurant menu or fridge contents).
    Identify the best food options for a student with this profile:
    Goal: ${userProfile.goal}
    Diet: ${userProfile.dietType}
    Restrictions: ${userProfile.restrictions.join(', ')}

    Recommend 3 top options.
  `;

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: {
        parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as MenuAnalysis;
    }
    throw new Error("No menu analysis returned");
  } catch (error) {
    console.error("Menu Scan Error:", error);
    throw error;
  }
};

/**
 * PainScan Analysis using Gemini 3 Pro
 */
export const analyzePain = async (symptoms: string, base64Image?: string): Promise<PainAnalysis> => {
  const model = "gemini-3-pro-preview"; 

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      muscle_involved: { type: Type.STRING, description: "Specific muscle or joint name" },
      cause: { type: Type.STRING, description: "Likely biomechanical or physiological cause" },
      severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
      correction: { type: Type.STRING, description: "Detailed posture or form correction advice" },
      stretches: { type: Type.ARRAY, items: { type: Type.STRING } },
      avoid_gym: { type: Type.BOOLEAN },
      recommendation: { type: Type.STRING, enum: ["Rest", "Light Activity", "See Doctor"] },
      recovery_timeline: { type: Type.STRING },
      detailed_explanation: { type: Type.STRING, description: "A comprehensive, medical-style explanation of why this pain is occurring and how the anatomy works." }
    },
    required: ["muscle_involved", "cause", "severity", "correction", "stretches", "avoid_gym", "recommendation", "recovery_timeline", "detailed_explanation"],
  };

  const parts: any[] = [{ text: `Analyze these symptoms/posture for a student: ${symptoms}. Provide a detailed, professional physiological analysis.` }];

  if (base64Image) {
    parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: base64Image } });
  }

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as PainAnalysis;
    }
    throw new Error("No analysis returned");
  } catch (error) {
    console.error("Pain Scan Error:", error);
    throw error;
  }
};

/**
 * Generate Daily Summary
 */
export const generateDailySummary = async (stats: UserStats): Promise<DailySummary> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "Daily health score 0-100" },
      summary: { type: Type.STRING, description: "3-5 sentences summary. Praise, improvements, suggestions." },
      focus_area: { type: Type.STRING },
    },
    required: ["score", "summary", "focus_area"],
  };

  const prompt = `
    Generate a daily health summary.
    Stats: ${JSON.stringify(stats)}
  `;

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as DailySummary;
    }
    throw new Error("No summary returned");
  } catch (error) {
    console.error("Summary Error:", error);
    throw error;
  }
};

/**
 * Calculate Hydration Goal
 */
export const calculateHydrationGoal = async (stats: UserStats, weatherCondition: string): Promise<{ target: number; advice: string }> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      target: { type: Type.INTEGER, description: "Recommended daily water intake in ml" },
      advice: { type: Type.STRING, description: "Short advice based on activity and weather" },
    },
    required: ["target", "advice"],
  };

  const prompt = `
    Calculate daily hydration goal.
    User Stats: ${JSON.stringify(stats)}
    Weather: ${weatherCondition}
  `;

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as { target: number; advice: string };
    }
    throw new Error("No hydration data returned");
  } catch (error) {
    console.error("Hydration Calc Error:", error);
    return {
      target: 2500,
      advice: "Stay hydrated! Drink water regularly."
    };
  }
};

/**
 * Generate Workout Insight
 */
export const generateWorkoutInsight = async (workout: Omit<WorkoutLogEntry, 'id' | 'timestamp' | 'aiInsight'>): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `
      The user just finished a workout.
      Type: ${workout.type}
      Duration: ${Math.floor(workout.duration / 60)} minutes
      Effort: ${workout.effort}
      Notes: ${workout.notes}
      Stats: ${workout.distance ? `Distance: ${workout.distance}km` : ''}

      Give a short, 1-sentence motivating insight or recovery tip. Be cool and student-friendly.
    `;
    
    try {
        const response = await requireClient().models.generateContent({
            model,
            contents: prompt,
        });
        return response.text || "Great workout! Drink some water and rest up.";
    } catch (e) {
        return "Awesome job! Keep crushing your goals.";
    }
};

/**
 * Generate Workout Plan
 */
export const generateWorkoutPlan = async (userProfile: UserProfile, activityType: string): Promise<WorkoutPlan> => {
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Catchy workout title e.g. 'Flash Cardio' or 'Heavy Push Day'" },
      exercises: { 
        type: Type.ARRAY, 
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.STRING },
            reps: { type: Type.STRING }
          }
        }
      },
      duration_min: { type: Type.INTEGER },
      focus: { type: Type.STRING, description: "Main focus e.g. 'Endurance', 'Hypertrophy'" }
    },
    required: ["title", "exercises", "duration_min", "focus"]
  };

  const prompt = `
    Create a detailed workout plan for today.
    User Goal: ${userProfile.goal}
    Activity Type: ${activityType}
    User Experience: ${userProfile.activityLevel}
    
    If activity is running/cardio, suggest intervals or steady state.
    If gym, suggest specific exercises.
  `;

  try {
    const response = await requireClient().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(cleanJSON(response.text)) as WorkoutPlan;
    }
    throw new Error("No workout plan returned");
  } catch (error) {
    console.error("Workout Plan Error:", error);
    // Fallback
    return {
      title: "Freestyle Session",
      exercises: [{ name: "Warmup", sets: "1", reps: "5 mins" }, { name: activityType, sets: "1", reps: "30 mins" }],
      duration_min: 35,
      focus: "General Fitness"
    };
  }
};
