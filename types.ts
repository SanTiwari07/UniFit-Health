
export interface MealData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  health_rating: number; // 1-10
  fat_loss_suitability: boolean;
  portion_change_recommendation: string;
  alternative: string;
  advice: string;
  food_name: string;
  is_uncertain?: boolean;
}

export interface MealLogEntry extends MealData {
  id: string;
  timestamp: Date;
}

export interface WorkoutLogEntry {
  id: string;
  type: string; // 'Running', 'Cycling', 'Gym', etc.
  duration: number; // seconds
  timestamp: Date;
  effort: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  notes: string;
  aiInsight?: string;
  distance?: number; // km
  pace?: string; // min/km
  avgSpeed?: number; // km/h
}

export interface WorkoutPlan {
  title: string;
  exercises: { name: string; sets: string; reps: string }[];
  duration_min: number;
  focus: string;
}

export interface PainAnalysis {
  muscle_involved: string;
  cause: string;
  severity: 'Low' | 'Medium' | 'High';
  correction: string;
  stretches: string[];
  avoid_gym: boolean;
  recommendation: 'Rest' | 'Light Activity' | 'See Doctor';
  recovery_timeline: string;
  detailed_explanation: string; // Added for more detail
}

export interface MenuRecommendation {
  itemName: string;
  reason: string;
  caloriesEstimate: number;
  proteinEstimate: number;
}

export interface MenuAnalysis {
  recommendations: MenuRecommendation[];
  bestOption: string;
  advice: string;
}

export interface DailySummary {
  score: number;
  summary: string;
  focus_area: string;
}

export enum ViewState {
  WELCOME = 'WELCOME',
  ONBOARDING = 'ONBOARDING',
  PLAN_REVEAL = 'PLAN_REVEAL', // New View
  DASHBOARD = 'DASHBOARD',
  MEAL_SCAN = 'MEAL_SCAN',
  CALORIE_HISTORY = 'CALORIE_HISTORY',
  WORKOUT_HISTORY = 'WORKOUT_HISTORY', 
  STEPS_HISTORY = 'STEPS_HISTORY', // New View
  HYDRA_AI = 'HYDRA_AI',
  HYDRATION_HISTORY = 'HYDRATION_HISTORY',
  PAIN_SCAN = 'PAIN_SCAN',
  GYM_TRACK = 'GYM_TRACK',
  PROFILE = 'PROFILE',
}

export interface UserStats {
  steps: number;
  stepsTarget: number; // Added target
  waterCurrent: number;
  waterTarget: number;
  caloriesIn: number;
  caloriesTarget: number;
  gymMinutes: number;
  mood: 'Happy' | 'Neutral' | 'Tired' | 'Stressed';
}

export interface UserProfile {
  weight: string;
  height: string;
  goal: 'Lose Weight' | 'Maintain' | 'Gain Muscle';
  targetWeight: string;
  dietType: string;
  restrictions: string[];
  activityLevel: string;
  workoutFreq: string;
  workoutTime: string;
  recurringPain: string[];
  proteinSupplements: boolean;
  eatingOutFreq: string;
  sleepHours: string;
  stressLevel: 'Low' | 'Medium' | 'High';
}

export interface AIProfileAnalysis {
  daily_calories: number;
  daily_water_ml: number;
  daily_protein_g: number;
  daily_steps: number; // New field
  timeline_prediction: string;
  hydration_warnings: string[];
  personalized_tips: string[];
  workout_intensity: string;
}
