const DietPlan = require('../models/DietPlan');
const DietLog = require('../models/DietLog');
const { Op } = require('sequelize');

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.20, light: 1.30, moderate: 1.45, active: 1.65, very_active: 1.8
};

// ── Real Indian Food Database (per serving, realistic household portions) ──
const INDIAN_FOODS = {
  // PROTEINS - Vegetarian
  paneer_100g:   { name: 'Paneer (100g)',          cal: 265, protein: 18, carbs: 3,  fat: 21, type: 'veg' },
  dal_cup:       { name: 'Dal (1 cup cooked)',      cal: 180, protein: 12, carbs: 28, fat: 1,  type: 'veg' },
  rajma_cup:     { name: 'Rajma (1 cup cooked)',    cal: 230, protein: 15, carbs: 40, fat: 1,  type: 'veg' },
  chana_cup:     { name: 'Chana/Chole (1 cup)',     cal: 270, protein: 15, carbs: 45, fat: 4,  type: 'veg' },
  moong_cup:     { name: 'Moong Dal (1 cup)',       cal: 150, protein: 10, carbs: 25, fat: 0.5,type: 'veg' },
  soyabean_100g: { name: 'Soya Chunks (100g dry)',  cal: 345, protein: 52, carbs: 33, fat: 1,  type: 'veg' },
  tofu_100g:     { name: 'Tofu (100g)',             cal: 80,  protein: 8,  carbs: 2,  fat: 4,  type: 'veg' },
  dahi_cup:      { name: 'Dahi/Curd (1 cup 200g)',  cal: 120, protein: 8,  carbs: 12, fat: 4,  type: 'veg' },
  milk_glass:    { name: 'Milk (1 glass 250ml)',    cal: 150, protein: 8,  carbs: 12, fat: 5,  type: 'veg' },
  sattu_2tbsp:   { name: 'Sattu (2 tbsp, 30g)',     cal: 100, protein: 7,  carbs: 15, fat: 2,  type: 'veg' },
  // PROTEINS - Eggs
  egg_whole:     { name: 'Whole Egg (1 egg)',        cal: 78,  protein: 6,  carbs: 0.6,fat: 5,  type: 'egg' },
  egg_white:     { name: 'Egg White (1 white)',      cal: 17,  protein: 4,  carbs: 0,  fat: 0,  type: 'egg' },
  omelette_2egg: { name: 'Omelette (2 eggs + veggies)', cal: 200, protein: 14, carbs: 3, fat: 14, type: 'egg' },
  boiled_eggs3:  { name: '3 Boiled Eggs',            cal: 234, protein: 18, carbs: 2,  fat: 15, type: 'egg' },
  // PROTEINS - Non-veg
  chicken_150g:  { name: 'Chicken Breast (150g)',   cal: 165, protein: 35, carbs: 0,  fat: 4,  type: 'nonveg' },
  chicken_curry: { name: 'Chicken Curry (150g)',     cal: 250, protein: 30, carbs: 5,  fat: 12, type: 'nonveg' },
  egg_bhurji:    { name: 'Egg Bhurji (3 eggs)',      cal: 280, protein: 20, carbs: 4,  fat: 20, type: 'nonveg' },
  fish_150g:     { name: 'Fish (Rohu/Pomfret 150g)', cal: 165, protein: 28, carbs: 0,  fat: 5,  type: 'nonveg' },
  fish_curry:    { name: 'Fish Curry (150g)',         cal: 230, protein: 25, carbs: 6,  fat: 12, type: 'nonveg' },
  tuna_can:      { name: 'Tuna Can (100g)',           cal: 130, protein: 29, carbs: 0,  fat: 1,  type: 'nonveg' },
  mutton_150g:   { name: 'Mutton (150g cooked)',      cal: 310, protein: 30, carbs: 0,  fat: 20, type: 'nonveg' },
  // PROTEIN POWDERS - Alternative to whey
  whey_scoop:    { name: 'Whey Protein (1 scoop)',   cal: 120, protein: 25, carbs: 3,  fat: 1,  type: 'supplement' },
  soya_powder:   { name: 'Soya Protein Powder (1 scoop)', cal: 110, protein: 23, carbs: 4, fat: 1, type: 'supplement' },
  pea_protein:   { name: 'Pea Protein (1 scoop)',    cal: 100, protein: 20, carbs: 2,  fat: 1,  type: 'supplement' },
  // CARBS
  roti_1:        { name: 'Roti/Chapati (1 medium)',  cal: 105, protein: 3,  carbs: 20, fat: 2,  type: 'carb' },
  rice_cup:      { name: 'Rice (1 cup cooked)',       cal: 200, protein: 4,  carbs: 44, fat: 0.5,type: 'carb' },
  brown_rice:    { name: 'Brown Rice (1 cup cooked)', cal: 215, protein: 5,  carbs: 45, fat: 2,  type: 'carb' },
  oats_cup:      { name: 'Oats (1 cup cooked)',       cal: 160, protein: 6,  carbs: 28, fat: 3,  type: 'carb' },
  poha_plate:    { name: 'Poha (1 plate ~150g)',      cal: 250, protein: 5,  carbs: 45, fat: 6,  type: 'carb' },
  upma_bowl:     { name: 'Upma (1 bowl)',             cal: 250, protein: 5,  carbs: 40, fat: 7,  type: 'carb' },
  idli_2:        { name: 'Idli (2 pieces)',           cal: 140, protein: 4,  carbs: 28, fat: 1,  type: 'carb' },
  dosa_1:        { name: 'Dosa (1 plain)',            cal: 180, protein: 4,  carbs: 30, fat: 5,  type: 'carb' },
  paratha_1:     { name: 'Paratha (1 with ghee)',     cal: 260, protein: 5,  carbs: 36, fat: 11, type: 'carb' },
  bread_2:       { name: 'Whole Wheat Bread (2 slices)', cal: 140, protein: 6, carbs: 26, fat: 2, type: 'carb' },
  banana:        { name: 'Banana (1 medium)',         cal: 90,  protein: 1,  carbs: 23, fat: 0,  type: 'carb' },
  sweet_potato:  { name: 'Sweet Potato (1 medium)',   cal: 130, protein: 2,  carbs: 30, fat: 0,  type: 'carb' },
  // FATS
  ghee_1tsp:     { name: 'Ghee (1 tsp)',              cal: 45,  protein: 0,  carbs: 0,  fat: 5,  type: 'fat' },
  peanut_butter: { name: 'Peanut Butter (1 tbsp)',    cal: 90,  protein: 4,  carbs: 3,  fat: 8,  type: 'fat' },
  almonds_10:    { name: 'Almonds (10 pieces)',        cal: 70,  protein: 2,  carbs: 2,  fat: 6,  type: 'fat' },
  groundnuts:    { name: 'Groundnuts (1 handful 30g)',cal: 170, protein: 7,  carbs: 5,  fat: 14, type: 'fat' },
  coconut_chutney:{ name: 'Coconut Chutney (2 tbsp)', cal: 60,  protein: 1,  carbs: 2,  fat: 5,  type: 'fat' },
  // VEGETABLES (low cal, high fiber)
  mixed_sabzi:   { name: 'Mixed Sabzi (1 bowl)',      cal: 80,  protein: 3,  carbs: 10, fat: 3,  type: 'veg' },
  salad_plate:   { name: 'Salad (cucumber+tomato+onion)', cal: 40, protein: 2, carbs: 8, fat: 0, type: 'veg' },
  spinach_100g:  { name: 'Palak/Spinach (100g)',      cal: 23,  protein: 3,  carbs: 4,  fat: 0,  type: 'veg' },
  // DRINKS
  chaas_glass:   { name: 'Chaas/Buttermilk (1 glass)',cal: 50,  protein: 3,  carbs: 4,  fat: 2,  type: 'veg' },
  nimbu_pani:    { name: 'Nimbu Pani (1 glass)',       cal: 30,  protein: 0,  carbs: 8,  fat: 0,  type: 'veg' },
  green_tea:     { name: 'Green Tea (1 cup)',          cal: 2,   protein: 0,  carbs: 0,  fat: 0,  type: 'veg' },
};

// ── Meal Plan Generator based on diet type + goal ──────────
const generateMealPlan = (targetCal, goal, dietType, proteinTarget) => {
  const isVeg = dietType === 'veg';
  const isEgg = dietType === 'eggetarian';
  const isNonVeg = dietType === 'nonveg';
  const noWhey = dietType === 'nowhey';

  // Helper to pick protein source
  const proteinSource = () => {
    if (isVeg || noWhey) return [INDIAN_FOODS.paneer_100g, INDIAN_FOODS.dal_cup, INDIAN_FOODS.rajma_cup, INDIAN_FOODS.soyabean_100g, INDIAN_FOODS.dahi_cup];
    if (isEgg) return [INDIAN_FOODS.boiled_eggs3, INDIAN_FOODS.omelette_2egg, INDIAN_FOODS.egg_bhurji, INDIAN_FOODS.paneer_100g, INDIAN_FOODS.dahi_cup];
    return [INDIAN_FOODS.chicken_150g, INDIAN_FOODS.chicken_curry, INDIAN_FOODS.fish_150g, INDIAN_FOODS.boiled_eggs3, INDIAN_FOODS.egg_bhurji];
  };

  const proteinSupplement = noWhey
    ? INDIAN_FOODS.soya_powder
    : (isVeg ? INDIAN_FOODS.soya_powder : INDIAN_FOODS.whey_scoop);

  if (goal === 'bulk') {
    return {
      breakfast: {
        label: 'Breakfast (~' + Math.round(targetCal * 0.25) + ' kcal)',
        options: isVeg || noWhey
          ? ['4 Roti + Paneer Bhurji (100g paneer) + 1 glass milk', 'Oats (1.5 cup) + Peanut Butter (2 tbsp) + Banana + 1 glass milk', 'Paratha x3 + Dahi (200g) + 100g Paneer/Curd']
          : isEgg
          ? ['5 Boiled Eggs (2 whole + 3 whites) + 4 Roti + 1 glass milk', 'Omelette (3 eggs) + 4 bread slices + banana + milk', 'Poha + 4 boiled eggs + milk']
          : ['5 Boiled Eggs + 4 Roti + 1 glass milk', '3 whole eggs omelette + 4 bread slices + banana + milk', 'Chicken sandwich (150g chicken) + milk'],
        macros: { cal: Math.round(targetCal*0.25), protein: Math.round(proteinTarget*0.25) }
      },
      lunch: {
        label: 'Lunch (~' + Math.round(targetCal * 0.35) + ' kcal)',
        options: isVeg || noWhey
          ? ['4 Roti + 1 cup Dal + 1 cup Rajma + Rice (1 cup) + Dahi + Salad', '4 Roti + Soya chunk curry (100g) + Rice (1 cup) + Dahi', 'Rice (2 cups) + Chana Dal + Paneer sabzi (100g) + Roti x2']
          : isEgg
          ? ['4 Roti + Egg curry (4 eggs) + Rice (1 cup) + Dal + Salad', '4 Roti + Omelette + Dal + Rice + Dahi', 'Rice (2 cups) + 4 boiled eggs + Dal + Roti x2']
          : ['4 Roti + Chicken curry (150g) + Rice (1 cup) + Dal + Salad', '4 Roti + Fish curry (150g) + Rice + Dahi', 'Rice (2 cups) + Chicken (150g) + Dal + Roti x2'],
        macros: { cal: Math.round(targetCal*0.35), protein: Math.round(proteinTarget*0.35) }
      },
      snack: {
        label: 'Pre/Post Workout Snack (~' + Math.round(targetCal * 0.15) + ' kcal)',
        options: noWhey
          ? ['Soya protein shake + Banana + 10 almonds', 'Sattu drink (4 tbsp sattu + milk + jaggery) + groundnuts', 'Paneer raw (100g) + banana + milk']
          : isVeg
          ? ['Whey shake + Banana + 10 almonds', 'Sattu drink + groundnuts', 'Soya protein + milk + banana']
          : isEgg
          ? ['Whey shake + Banana + 10 almonds', '4 boiled eggs + banana', 'Soya protein shake + milk + banana']
          : ['Whey shake + Banana + 10 almonds', '4 boiled eggs + banana', 'Chicken sandwich + milk'],
        macros: { cal: Math.round(targetCal*0.15), protein: Math.round(proteinTarget*0.25) }
      },
      dinner: {
        label: 'Dinner (~' + Math.round(targetCal * 0.25) + ' kcal)',
        options: isVeg || noWhey
          ? ['3 Roti + Paneer curry (100g) + Dal + Salad', '3 Roti + Rajma + Dahi + mixed sabzi', 'Rice (1 cup) + Dal makhani + Paneer sabzi + Roti x2']
          : isEgg
          ? ['3 Roti + Egg curry (3 eggs) + Dal + Salad', '3 Roti + Egg bhurji + Dal + Dahi', 'Rice + Egg curry + Dal + Salad']
          : ['3 Roti + Chicken curry (150g) + Dal + Salad', '3 Roti + Fish curry + Dahi + Salad', 'Rice + Chicken + Dal + Roti x2'],
        macros: { cal: Math.round(targetCal*0.25), protein: Math.round(proteinTarget*0.25) }
      }
    };
  }

  if (goal === 'cut') {
    return {
      breakfast: {
        label: 'Breakfast (~' + Math.round(targetCal * 0.25) + ' kcal)',
        options: isVeg || noWhey
          ? ['Oats (1 cup) + 1 glass low-fat milk + 10 almonds + green tea', '2 Moong dal chilla + green chutney + chaas', 'Besan cheela x2 + dahi (low fat) + green tea']
          : isEgg
          ? ['3 egg whites + 1 whole egg omelette + 2 slices bread + green tea', '3 boiled eggs + oats (1 cup) + black coffee', '2 egg bhurji + 2 roti + chaas']
          : ['3 boiled eggs + oats (1 cup) + black coffee', '2 egg whites + 1 whole egg + 2 bread slices + green tea', 'Chicken sandwich (100g chicken, 2 bread) + black coffee'],
        macros: { cal: Math.round(targetCal*0.25), protein: Math.round(proteinTarget*0.30) }
      },
      lunch: {
        label: 'Lunch (~' + Math.round(targetCal * 0.35) + ' kcal)',
        options: isVeg || noWhey
          ? ['2 Roti + Dal (1 cup) + mixed sabzi + salad + chaas', '2 Roti + Soya sabzi + Dal + Salad', 'Brown rice (3/4 cup) + Dal + Sabzi + Salad']
          : isEgg
          ? ['2 Roti + Egg curry (2 eggs) + Dal + Salad', '2 Roti + Egg white bhurji (4 whites) + Dal + Salad', 'Brown rice + 2 boiled eggs + Dal + Sabzi']
          : ['2 Roti + Chicken breast (150g grilled) + Dal + Salad', '2 Roti + Fish (150g) + Dal + Salad', 'Brown rice (3/4 cup) + Chicken + Salad'],
        macros: { cal: Math.round(targetCal*0.35), protein: Math.round(proteinTarget*0.35) }
      },
      snack: {
        label: 'Evening Snack (~' + Math.round(targetCal * 0.10) + ' kcal)',
        options: ['Roasted chana (30g) + green tea', 'Cucumber + tomato + lemon + salt', 'Paneer cubes (50g) + nimbu pani', 'Low-fat dahi (150g)', 'Sprouts (1 cup) + lemon'],
        macros: { cal: Math.round(targetCal*0.10), protein: Math.round(proteinTarget*0.10) }
      },
      dinner: {
        label: 'Dinner (~' + Math.round(targetCal * 0.30) + ' kcal)',
        options: isVeg || noWhey
          ? ['2 Roti + Dal + Palak sabzi + Salad', '1 Roti + Dal soup (thick) + Tofu stir fry + Salad', 'Moong dal khichdi (small) + low-fat dahi + Salad']
          : isEgg
          ? ['2 Roti + 2 egg whites omelette + Dal + Salad', '1 Roti + Egg curry (2 eggs) + Salad', 'Egg white bhurji + 2 roti + dal + salad']
          : ['2 Roti + Chicken breast (grilled 100g) + Salad', '1 Roti + Fish (baked/grilled 150g) + Salad + Dal', 'Chicken soup + 1 roti + salad'],
        macros: { cal: Math.round(targetCal*0.30), protein: Math.round(proteinTarget*0.25) }
      }
    };
  }

  // maintain
  return {
    breakfast: {
      label: 'Breakfast (~' + Math.round(targetCal * 0.25) + ' kcal)',
      options: isVeg || noWhey
        ? ['2 Paratha + Dahi (200g) + 1 glass milk', 'Idli x4 + Sambar + Coconut chutney', 'Oats + milk + banana + almonds (10)']
        : isEgg
        ? ['2 eggs omelette + 2 Paratha + 1 glass milk', 'Poha + 2 boiled eggs + tea', '3 boiled eggs + 2 bread + banana + milk']
        : ['2 boiled eggs + 2 paratha + milk', 'Egg omelette + bread x2 + banana + milk', 'Chicken sandwich + milk'],
      macros: { cal: Math.round(targetCal*0.25), protein: Math.round(proteinTarget*0.25) }
    },
    lunch: {
      label: 'Lunch (~' + Math.round(targetCal * 0.35) + ' kcal)',
      options: isVeg || noWhey
        ? ['3 Roti + Dal + Sabzi + Rice (3/4 cup) + Dahi + Salad', 'Chole + Rice + Roti x2 + Dahi', 'Rajma Rice + Roti x2 + Salad + Dahi']
        : isEgg
        ? ['3 Roti + Egg curry (3 eggs) + Dal + Rice + Salad', '3 Roti + Dal + Egg bhurji + Rice', 'Rice + 3 boiled eggs + Dal + Sabzi + Roti x2']
        : ['3 Roti + Chicken curry (150g) + Dal + Rice + Salad', '3 Roti + Fish curry + Dal + Rice', 'Rice + Chicken + Dal + Roti x2'],
      macros: { cal: Math.round(targetCal*0.35), protein: Math.round(proteinTarget*0.35) }
    },
    snack: {
      label: 'Evening Snack (~' + Math.round(targetCal * 0.10) + ' kcal)',
      options: ['Sprouts chaat + chaas', 'Makhana (roasted, 30g) + tea', 'Groundnuts (30g) + chaas', '1 banana + 10 almonds', 'Fruit bowl + dahi'],
      macros: { cal: Math.round(targetCal*0.10), protein: Math.round(proteinTarget*0.10) }
    },
    dinner: {
      label: 'Dinner (~' + Math.round(targetCal * 0.30) + ' kcal)',
      options: isVeg || noWhey
        ? ['2 Roti + Dal + Sabzi + Salad + Dahi', 'Khichdi (1 bowl) + Dahi + Papad', 'Paneer curry + 2 Roti + Salad']
        : isEgg
        ? ['2 Roti + Egg curry (2 eggs) + Dal + Salad', '2 Roti + Egg bhurji + Dal + Dahi', 'Rice + egg curry + salad']
        : ['2 Roti + Chicken (100g) + Dal + Salad', '2 Roti + Fish curry + Salad', 'Rice + chicken + dal + salad'],
      macros: { cal: Math.round(targetCal*0.30), protein: Math.round(proteinTarget*0.25) }
    }
  };
};

const calculateBMR = (weight, height, age, gender) => {
  const w = Number(weight), h = Number(height), a = Number(age);
  if (gender === 'female') return Math.round(10*w + 6.25*h - 5*a - 161);
  return Math.round(10*w + 6.25*h - 5*a + 5);
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 25)   return { label: 'Normal',       color: 'green' };
  if (bmi < 30)   return { label: 'Overweight',   color: 'yellow' };
  return                  { label: 'Obese',        color: 'red' };
};

const calculateDiet = async (req, res) => {
  try {
    let { weight, height, age, gender, activityLevel, goal, dietType } = req.body;
    weight = Number(weight); height = Number(height); age = Number(age);
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!dietType) dietType = 'veg'; // default safe

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));

    let targetCalories;
    if (goal === 'bulk') targetCalories = tdee + 300;
    else if (goal === 'cut') targetCalories = Math.max(tdee - 400, 1200);
    else targetCalories = tdee;

    // Macro split based on goal
    let pRatio, cRatio, fRatio;
    if (goal === 'bulk')     { pRatio = 0.20; cRatio = 0.50; fRatio = 0.30; }
    else if (goal === 'cut') { pRatio = 0.30; cRatio = 0.50; fRatio = 0.20; }
    else                     { pRatio = 0.25; cRatio = 0.55; fRatio = 0.25; }

    const macros = {
      protein: Math.round((targetCalories * pRatio) / 4),
      carbs:   Math.round((targetCalories * cRatio) / 4),
      fats:    Math.round((targetCalories * fRatio) / 9),
    };

    const mealPlan = generateMealPlan(targetCalories, goal, dietType, macros.protein);
    const bmi = parseFloat((weight / ((height/100)**2)).toFixed(1));
    // Increased water intake calculation: weight * 40 instead of 35
    const waterIntake = parseFloat((weight * 40 / 1000).toFixed(1));

    // Protein tips
    const proteinTips = [];
    if (dietType === 'veg' || dietType === 'nowhey') {
      proteinTips.push('Combine dal + roti for complete amino acid profile');
      proteinTips.push('Soya chunks are the cheapest high-protein veg source (52g per 100g dry)');
      proteinTips.push('Paneer gives 18g protein per 100g — eat it daily');
      proteinTips.push('Sattu (roasted gram flour) is an underrated protein source');
    } else if (dietType === 'eggetarian') {
      proteinTips.push('Eggs are the most complete protein source available in India');
      proteinTips.push('Eat 3-5 eggs per day — whole eggs for bulking, more whites for cutting');
      proteinTips.push('Combine with dal and dahi for complete amino coverage');
    } else {
      proteinTips.push('Chicken breast has 35g protein per 150g at very low fat');
      proteinTips.push('Fish (Rohu, Surmai, Pomfret) is excellent lean protein');
      proteinTips.push('Combine non-veg with dal — you need the fiber too');
    }

    // Save/update using upsert
    const [dietPlan] = await DietPlan.upsert(
      { 
        userId: req.user.id,
        weight, height, age, gender, activityLevel, goal, dietType,
        bmr, tdee, targetCalories, macros, mealPlan, waterIntake, isActive: true 
      },
      { returning: true }
    );

    res.json({
      success: true,
      dietPlan: {
        bmr, tdee, targetCalories, macros, mealPlan, waterIntake,
        bmi, bmiCategory: getBMICategory(bmi),
        dietType, goal, proteinTips,
        dailyProteinPerKg: (macros.protein / weight).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Diet calc error:', error);
    res.status(500).json({ message: 'Error calculating diet plan', error: error.message });
  }
};

// @desc    Get saved diet plan
// @route   GET /api/diet
const getDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ 
      where: { userId: req.user.id, isActive: true } 
    });
    if (!plan) return res.status(404).json({ message: 'No diet plan found. Please calculate one.' });
    
    // Calculate BMI on the fly if missing from DB record
    const bmi = parseFloat((plan.weight / ((plan.height/100)**2)).toFixed(1));
    
    // Convert to plain object to add calculated fields
    const planData = plan.toJSON();
    planData.bmi = bmi;
    planData.bmiCategory = getBMICategory(bmi);

    res.json({ success: true, dietPlan: planData });
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({ message: 'Error fetching diet plan' });
  }
};

// @desc    Log a meal
// @route   POST /api/diet/log
const logMeal = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats } = req.body;
    console.log('[DIET LOG] Attempting to log:', { userId: req.user.id, name, calories, protein, carbs, fats });
    
    if (!name) {
      console.warn('[DIET LOG] Missing meal name');
      return res.status(400).json({ message: 'Meal name is required' });
    }
    
    const log = await DietLog.create({
      userId: req.user.id,
      name,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fats: parseFloat(fats) || 0,
      date: new Date().toISOString().split('T')[0]
    });
    
    console.log('[DIET LOG] Successfully created log:', log.id);
    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error('[DIET LOG] Create error:', error);
    res.status(500).json({ message: 'Error logging meal', details: error.message });
  }
};

// @desc    Get today's diet logs
// @route   GET /api/diet/logs/today
const getTodaysLog = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logs = await DietLog.findAll({
      where: {
        userId: req.user.id,
        date: today
      },
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error('[DIET LOG] Fetch error:', error);
    res.status(500).json({ message: 'Error fetching today\'s logs' });
  }
};

// @desc    Delete a diet log
// @route   DELETE /api/diet/logs/:id
const deleteLog = async (req, res) => {
  try {
    const log = await DietLog.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    await log.destroy();
    res.json({ success: true, message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting log' });
  }
};

module.exports = { calculateDiet, getDietPlan, logMeal, getTodaysLog, deleteLog, INDIAN_FOODS };
