
'use server';
/**
 * @fileOverview A flow for generating fitness and diet plans.
 *
 * - generatePlan - A function that creates a personalized plan.
 * - GeneratePlanInput - The input type for the generatePlan function.
 * - GeneratePlanOutput - The return type for the generatePlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePlanInputSchema = z.object({
  planType: z.enum(['workout', 'diet']),
  user: z.object({
    goal: z.string().describe('The user\'s primary fitness goal (e.g., "Build muscle", "Lose weight").'),
    level: z.number().describe('The user\'s current level, indicating their experience.'),
  }),
  dietPreference: z.enum(['veg', 'non-veg']).optional().describe('The user\'s dietary preference, only if the plan type is "diet".'),
});
export type GeneratePlanInput = z.infer<typeof GeneratePlanInputSchema>;

const GeneratePlanOutputSchema = z.object({
  plan: z.string().describe('The detailed, formatted plan as a single block of text. For workouts, include exercise names, sets, reps, and points in brackets like [10pts].'),
});
export type GeneratePlanOutput = z.infer<typeof GeneratePlanOutputSchema>;

export async function generatePlan(input: GeneratePlanInput): Promise<GeneratePlanOutput> {
  return planGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planGeneratorPrompt',
  input: { schema: GeneratePlanInputSchema },
  output: { schema: GeneratePlanOutputSchema },
  prompt: `You are an expert fitness planner for a gamified app inspired by "Solo Leveling". Users are called "Hunters".

Your task is to generate a {{planType}} plan for a user with the following details:
- Goal: {{user.goal}}
- Level: {{user.level}}
{{#if dietPreference}}- Diet Preference: {{dietPreference}}{{/if}}

**Workout Plan Instructions:**
- Create a list of 5-7 exercises suitable for the user's goal and level.
- Format each exercise on a new line starting with "- ".
- Include sets and reps/duration (e.g., "3x12" or "3x60s").
- Assign points to each exercise based on difficulty, enclosed in brackets (e.g., [10pts], [15pts]). Harder exercises are worth more.
- The plan should be concise and ready to be displayed.

**Diet Plan Instructions:**
- Use the examples below as a template for generating the diet plan.
- Select the plan that best matches the user's goal.
- Adjust the food items based on the user's dietary preference ({{dietPreference}}). For example, replace chicken/fish with paneer/tofu for vegetarians.
- Keep the structure (Breakfast, Lunch, Dinner, etc.) and format it as a single block of text with clear headings.

---
**DIET PLAN EXAMPLES**

**EXAMPLE 1: MUSCLE GAIN DIET PLAN (for "Build Muscle", "Increase Strength")**
Goal: Gain lean muscle & strength
Calories: 2,800–3,200 kcal/day (adjust for user level)

- **Morning (7–8 AM):**
  - 4 boiled eggs (2 full + 2 whites) OR 150g Paneer Bhurji
  - 2 brown breads with peanut butter
  - 1 banana or apple
  - 1 glass milk

- **Mid-Morning Snack (10–11 AM):**
  - Handful of dry fruits (almonds, cashews)
  - 1 banana or protein shake

- **Lunch (1–2 PM):**
  - 2–3 rotis or 1 bowl brown rice
  - 1 cup dal / rajma / chole
  - 150g paneer or chicken breast/fish
  - Salad + curd

- **Evening Snack (5–6 PM):**
  - Boiled sweet potato or sprouts salad
  - 1 glass milk or black coffee (before workout)

- **Post-Workout (Immediately after gym):**
  - 1 scoop whey protein + 1 banana

- **Dinner (8–9 PM):**
  - 2 rotis + sabzi + paneer/chicken/fish
  - Salad + curd

- **Before Bed (10–11 PM):**
  - 1 glass warm milk / casein protein

**EXAMPLE 2: FAT LOSS DIET PLAN (for "Lose Weight")**
Goal: Reduce fat while maintaining muscle
Calories: 1,600–1,900 kcal/day

- **Morning (7–8 AM):**
  - 3 boiled egg whites + 1 full egg OR Oats/Poha
  - Green tea or black coffee

- **Mid-Morning Snack:**
  - 1 apple or 1 handful almonds

- **Lunch:**
  - 1 bowl brown rice or 2 multigrain rotis
  - 1 cup dal + 1 sabzi
  - Grilled paneer/tofu/chicken (100–150g)
  - Salad (no dressing)

- **Evening Snack:**
  - Green tea + roasted chana
  - (Optional: pre-workout black coffee)

- **Post-Workout:**
  - 1 scoop whey protein in water
  - 1 fruit (banana or papaya)

- **Dinner (light):**
  - Soup + vegetables + paneer/tofu/chicken
  - Avoid rice and sweets

- **Before Bed:**
  - 1 cup warm water or green tea

**EXAMPLE 3: FITNESS / MAINTENANCE DIET PLAN (for "Improve Endurance", "General Fitness")**
Goal: Stay fit, maintain energy, no major gain/loss
Calories: 2,000–2,300 kcal/day

- **Morning:**
  - 2 boiled eggs + 2 rotis OR Poha/Upma
  - 1 banana
  - 1 glass milk

- **Mid-Morning Snack:**
  - 1 fruit or 1 handful nuts

- **Lunch:**
  - 2–3 rotis + dal + sabzi
  - 100g paneer or egg curry
  - Salad + curd

- **Evening Snack:**
  - Sprouts / roasted chana
  - Tea or coffee (no sugar)

- **Dinner:**
  - Light meal (roti + sabzi + paneer/chicken)
  - Salad

- **Before Bed:**
  - 1 glass milk (optional)
---

Generate the {{planType}} plan now.
`,
});

const planGeneratorFlow = ai.defineFlow(
  {
    name: 'planGeneratorFlow',
    inputSchema: GeneratePlanInputSchema,
    outputSchema: GeneratePlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
