import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const FormulaSchema = z.object({
  formulas: z.array(
    z.object({
      name: z.string(),
      brand: z.string(),
      caloriesPerMl: z.number(),
      proteinPerMl: z.number(),
      description: z.string(),
      indications: z.array(z.string()),
      osmolality: z.number().optional(),
      fiberContent: z.string().optional(),
      specialFeatures: z.array(z.string()).optional(),
    }),
  ),
})

// Comprehensive enteral formula database
const ENTERAL_FORMULAS = [
  // ===== KATE FARMS (Plant-based) =====
  {
    name: "Kate Farms Standard 1.0",
    brand: "Kate Farms",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.035,
    description: "Plant-based, organic enteral formula with pea protein",
    indications: ["General nutrition", "Plant-based nutrition", "Dairy intolerance"],
    osmolality: 375,
    fiberContent: "7g per 325mL",
    specialFeatures: ["Plant-based", "Organic", "Non-GMO", "Dairy-free", "Soy-free"],
  },
  {
    name: "Kate Farms Standard 1.5",
    brand: "Kate Farms",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.045,
    description: "Higher calorie plant-based enteral formula",
    indications: ["Increased caloric needs", "Fluid restriction", "Weight gain"],
    osmolality: 490,
    fiberContent: "7g per 325mL",
    specialFeatures: ["Plant-based", "High calorie", "Organic", "Dairy-free"],
  },
  {
    name: "Kate Farms Peptide 1.5",
    brand: "Kate Farms",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.056,
    description: "Plant-based peptide formula for enhanced absorption",
    indications: ["Malabsorption", "GI compromise", "Critical care"],
    osmolality: 450,
    fiberContent: "Fiber-free",
    specialFeatures: ["Plant-based peptides", "Easy absorption", "Organic"],
  },

  // ===== COMPLEAT (Whole Food) =====
  {
    name: "Compleat Pediatric",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.038,
    description: "Whole food blended formula for pediatric patients",
    indications: ["Pediatric nutrition", "Whole food feeding", "Food tolerance"],
    osmolality: 390,
    fiberContent: "3.5g per 250mL",
    specialFeatures: ["Whole food blended", "Pediatric formula", "Natural food ingredients"],
  },
  {
    name: "Compleat",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Whole food blended enteral formula for adults",
    indications: ["General nutrition", "Whole food feeding", "Food tolerance"],
    osmolality: 390,
    fiberContent: "4g per 250mL",
    specialFeatures: ["Whole food blended", "Real food", "Natural ingredients", "Gluten-free"],
  },
  {
    name: "Compleat Plus",
    brand: "Nestlé",
    caloriesPerMl: 1.2,
    proteinPerMl: 0.052,
    description: "Higher calorie whole food blended formula",
    indications: ["Increased caloric needs", "Whole food preference", "Fluid restriction"],
    osmolality: 480,
    fiberContent: "5g per 250mL",
    specialFeatures: ["High calorie", "Whole food", "Increased nutrients"],
  },

  // ===== ELECARE (Hypoallergenic Pediatric) =====
  {
    name: "Elecare Jr.",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.035,
    description: "Hypoallergenic elemental formula for children with allergies",
    indications: ["Food allergies", "Multiple protein intolerance", "Eosinophilic disorders"],
    osmolality: 630,
    fiberContent: "Fiber-free",
    specialFeatures: ["Elemental", "Hypoallergenic", "Pediatric", "Amino acid based"],
  },
  {
    name: "Elecare",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.038,
    description: "Hypoallergenic elemental formula for severe allergies",
    indications: ["Multiple food allergies", "Eosinophilic disorders", "Severe malabsorption"],
    osmolality: 630,
    fiberContent: "Fiber-free",
    specialFeatures: ["Elemental", "Hypoallergenic", "Amino acid based", "Lactose-free"],
  },

  // ===== ABBOTT - STANDARD FORMULAS =====
  {
    name: "Jevity 1.0",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Standard fiber-containing enteral formula",
    indications: ["General nutrition", "Long-term feeding", "GI tolerance"],
    osmolality: 300,
    fiberContent: "14g per 1000mL",
    specialFeatures: ["Fiber-containing", "Lactose-free", "Gluten-free"],
  },
  {
    name: "Jevity 1.2",
    brand: "Abbott",
    caloriesPerMl: 1.2,
    proteinPerMl: 0.056,
    description: "Higher calorie fiber-containing enteral formula",
    indications: ["Increased caloric needs", "Fluid restriction"],
    osmolality: 390,
    fiberContent: "14g per 1000mL",
    specialFeatures: ["High calorie", "Fiber-containing", "Lactose-free"],
  },
  {
    name: "Jevity 1.5",
    brand: "Abbott",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "Very high calorie fiber-containing formula",
    indications: ["Severe fluid restriction", "High caloric needs", "Weight gain"],
    osmolality: 465,
    fiberContent: "14g per 1000mL",
    specialFeatures: ["Very high calorie", "Concentrated", "Fiber-containing"],
  },
  {
    name: "Osmolite 1.0",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Standard isotonic enteral formula without fiber",
    indications: ["GI intolerance", "Post-surgical", "Critical care"],
    osmolality: 300,
    fiberContent: "Fiber-free",
    specialFeatures: ["Isotonic", "Fiber-free", "Easy to digest"],
  },
  {
    name: "Osmolite 1.2",
    brand: "Abbott",
    caloriesPerMl: 1.2,
    proteinPerMl: 0.044,
    description: "Higher calorie isotonic enteral formula",
    indications: ["Increased caloric needs", "Fluid restriction", "Critical care"],
    osmolality: 360,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "Isotonic", "Concentrated nutrition"],
  },
  {
    name: "Osmolite 1.5",
    brand: "Abbott",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "Very high calorie isotonic formula",
    indications: ["Severe fluid restriction", "High caloric needs"],
    osmolality: 450,
    fiberContent: "Fiber-free",
    specialFeatures: ["Very high calorie", "Isotonic", "Concentrated"],
  },

  // ===== ABBOTT - DISEASE-SPECIFIC =====
  {
    name: "Glucerna 1.0",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.042,
    description: "Diabetes-specific enteral formula with modified carbohydrates",
    indications: ["Diabetes", "Glucose intolerance", "Metabolic syndrome"],
    osmolality: 355,
    fiberContent: "15g per 1000mL",
    specialFeatures: ["Diabetes-specific", "Slow-release carbs", "High fiber"],
  },
  {
    name: "Glucerna 1.5",
    brand: "Abbott",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "High calorie diabetes-specific formula",
    indications: ["Diabetes with high caloric needs", "Glucose intolerance"],
    osmolality: 465,
    fiberContent: "15g per 1000mL",
    specialFeatures: ["High calorie", "Diabetes-specific", "High fiber"],
  },
  {
    name: "Pulmocare",
    brand: "Abbott",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "High-fat, low-carb enteral formula for respiratory patients",
    indications: ["COPD", "Respiratory failure", "Ventilator patients"],
    osmolality: 475,
    fiberContent: "Fiber-free",
    specialFeatures: ["High fat", "Low CO2 production", "Concentrated"],
  },
  {
    name: "Nepro",
    brand: "Abbott",
    caloriesPerMl: 2.0,
    proteinPerMl: 0.081,
    description: "Renal enteral formula with modified protein and electrolytes",
    indications: ["Chronic kidney disease", "Dialysis", "Renal insufficiency"],
    osmolality: 665,
    fiberContent: "Fiber-free",
    specialFeatures: ["Renal-specific", "High calorie", "Modified electrolytes", "Low sodium"],
  },
  {
    name: "Nepro ML",
    brand: "Abbott",
    caloriesPerMl: 2.0,
    proteinPerMl: 0.07,
    description: "Renal formula with lower protein and phosphorus",
    indications: ["Chronic kidney disease", "Dialysis", "Mineral metabolism issues"],
    osmolality: 665,
    fiberContent: "Fiber-free",
    specialFeatures: ["Renal-specific", "Low protein", "Low phosphorus"],
  },
  {
    name: "Hepatic-Aid",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Hepatic enteral formula for liver disease patients",
    indications: ["Cirrhosis", "Hepatic encephalopathy", "Liver disease"],
    osmolality: 310,
    fiberContent: "Fiber-free",
    specialFeatures: ["Hepatic formula", "Modified amino acids", "BCAA enriched"],
  },

  // ===== NESTLÉ/PEPTAMEN FORMULAS =====
  {
    name: "Vivonex T.E.N.",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.038,
    description: "Elemental enteral formula with free amino acids",
    indications: ["Malabsorption", "Crohn's disease", "Short gut syndrome"],
    osmolality: 630,
    fiberContent: "Fiber-free",
    specialFeatures: ["Elemental", "Pre-digested", "Hypoallergenic"],
  },
  {
    name: "Vivonex Plus",
    brand: "Nestlé",
    caloriesPerMl: 1.35,
    proteinPerMl: 0.048,
    description: "Higher calorie elemental formula",
    indications: ["Malabsorption with high caloric needs", "Severe GI disease"],
    osmolality: 810,
    fiberContent: "Fiber-free",
    specialFeatures: ["Elemental", "High calorie", "Hypoallergenic"],
  },
  {
    name: "Peptamen",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Semi-elemental enteral formula with peptides",
    indications: ["Maldigestion", "Pancreatitis", "IBD"],
    osmolality: 270,
    fiberContent: "Fiber-free",
    specialFeatures: ["Semi-elemental", "Easy absorption", "MCT oil"],
  },
  {
    name: "Peptamen 1.5",
    brand: "Nestlé",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "Higher calorie semi-elemental peptide formula",
    indications: ["Maldigestion with high needs", "Severe pancreatitis"],
    osmolality: 405,
    fiberContent: "Fiber-free",
    specialFeatures: ["Semi-elemental", "High calorie", "Easy absorption"],
  },
  {
    name: "Peptamen AF",
    brand: "Nestlé",
    caloriesPerMl: 1.2,
    proteinPerMl: 0.048,
    description: "Semi-elemental formula with added arginine and glutamine",
    indications: ["Wound healing", "Immune support", "GI disease"],
    osmolality: 300,
    fiberContent: "Fiber-free",
    specialFeatures: ["Peptides", "Arginine", "Glutamine", "Immunonutrition"],
  },
  {
    name: "Impact",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.056,
    description: "Immune-enhancing enteral formula with arginine, omega-3, nucleotides",
    indications: ["Surgery", "Trauma", "Immune compromise"],
    osmolality: 375,
    fiberContent: "Fiber-free",
    specialFeatures: ["Immune-enhancing", "Arginine", "Omega-3 fatty acids", "Nucleotides"],
  },
  {
    name: "Impact 1.5",
    brand: "Nestlé",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.075,
    description: "High calorie immune-enhancing formula",
    indications: ["Surgery/trauma with high needs", "Critical care"],
    osmolality: 525,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "Immune-enhancing", "Concentrated nutrition"],
  },
  {
    name: "Impact Peptide 1.5",
    brand: "Nestlé",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "High calorie peptide-based immune-enhancing formula",
    indications: ["GI compromise with high needs", "Peptide formula preferred"],
    osmolality: 500,
    fiberContent: "Fiber-free",
    specialFeatures: ["Peptides", "High calorie", "Immune-enhancing"],
  },
  {
    name: "Resource Glutamine",
    brand: "Nestlé",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.035,
    description: "Standard formula enhanced with glutamine",
    indications: ["Critical illness", "Gut healing", "Immune support"],
    osmolality: 295,
    fiberContent: "Fiber-free",
    specialFeatures: ["Glutamine enriched", "Immune support", "Gut health"],
  },

  // ===== WHOLE FOOD FORMULAS =====
  {
    name: "Real Food Blends",
    brand: "Real Food Blends",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Whole food enteral formula made from real ingredients",
    indications: ["Whole food nutrition", "Food allergies", "Natural feeding"],
    osmolality: 300,
    fiberContent: "Natural fiber from whole foods",
    specialFeatures: ["Whole food", "No artificial ingredients", "Allergen-friendly"],
  },
  {
    name: "Liquid Hope",
    brand: "Functional Formularies",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Organic whole food enteral formula",
    indications: ["Whole food nutrition", "Organic feeding", "Food sensitivities"],
    osmolality: 300,
    fiberContent: "Natural fiber from whole foods",
    specialFeatures: ["Organic", "Whole food", "Non-GMO", "Shelf-stable"],
  },
  {
    name: "Liquid Hope For Meals",
    brand: "Functional Formularies",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.035,
    description: "Organic whole food formula for meal replacement",
    indications: ["Partial oral/tube feeding", "Supplement nutrition"],
    osmolality: 320,
    fiberContent: "Natural fiber",
    specialFeatures: ["Organic", "Real food ingredients", "Balanced nutrition"],
  },

  // ===== NUTRICIA FORMULAS =====
  {
    name: "Nutrison",
    brand: "Nutricia",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Standard enteral formula for tube feeding",
    indications: ["General nutrition", "Long-term feeding"],
    osmolality: 285,
    fiberContent: "Fiber-free",
    specialFeatures: ["Lactose-free", "Gluten-free", "Standard formula"],
  },
  {
    name: "Nutrison 1.5",
    brand: "Nutricia",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "High calorie standard formula",
    indications: ["Fluid restriction", "High caloric needs"],
    osmolality: 420,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "Concentrated", "Lactose-free"],
  },
  {
    name: "Nutrison Multi Fiber",
    brand: "Nutricia",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Formula with added dietary fiber",
    indications: ["General nutrition", "Constipation", "Bowel regulation"],
    osmolality: 300,
    fiberContent: "10g per 1000mL",
    specialFeatures: ["Multi-fiber blend", "Bowel health", "Standard calories"],
  },
  {
    name: "Nutrison Standard Fiber",
    brand: "Nutricia",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Fiber-enriched enteral formula",
    indications: ["General nutrition", "Diarrhea prevention", "GI health"],
    osmolality: 310,
    fiberContent: "9g per 1000mL",
    specialFeatures: ["Fiber-enriched", "Lactose-free", "Supports digestion"],
  },
  {
    name: "Nutrison Protein Plus",
    brand: "Nutricia",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.06,
    description: "High protein enteral formula",
    indications: ["High protein needs", "Wound healing", "Muscle recovery"],
    osmolality: 295,
    fiberContent: "Fiber-free",
    specialFeatures: ["High protein", "Muscle support", "Wound healing"],
  },
  {
    name: "Nutrison Diabet",
    brand: "Nutricia",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Diabetes-specific formula with controlled carbohydrates",
    indications: ["Diabetes", "Glucose intolerance"],
    osmolality: 310,
    fiberContent: "12g per 1000mL",
    specialFeatures: ["Diabetes-specific", "High fiber", "Slow-release carbs"],
  },

  // ===== FRESENIUS FORMULAS =====
  {
    name: "Fresubin 1000 Complete",
    brand: "Fresenius",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Nutritionally complete enteral formula",
    indications: ["General nutrition", "Complete nutrition"],
    osmolality: 285,
    fiberContent: "Fiber-free",
    specialFeatures: ["Complete formula", "Lactose-free", "Gluten-free"],
  },
  {
    name: "Fresubin Energy",
    brand: "Fresenius",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "High-energy enteral formula for increased caloric needs",
    indications: ["Increased caloric needs", "Fluid restriction", "High energy requirements"],
    osmolality: 430,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "Concentrated", "Lactose-free"],
  },
  {
    name: "Fresubin Energy Fibre",
    brand: "Fresenius",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "High-energy enteral formula with added fiber for improved digestion",
    indications: ["Increased caloric needs", "Fluid restriction", "Bowel regulation", "GI health"],
    osmolality: 450,
    fiberContent: "6g per 200mL",
    specialFeatures: ["High calorie", "Fiber-enriched", "Multi-fiber blend", "Lactose-free"],
  },
  {
    name: "Fresubin Original",
    brand: "Fresenius",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Standard complete enteral nutrition formula",
    indications: ["General nutrition", "Long-term feeding", "Routine nutrition"],
    osmolality: 300,
    fiberContent: "Fiber-free",
    specialFeatures: ["Standard formula", "Lactose-free", "Balanced nutrition"],
  },
  {
    name: "Fresubin Protein Energy",
    brand: "Fresenius",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.075,
    description: "High-energy, high-protein formula for advanced nutritional support",
    indications: ["High protein needs", "Wound healing", "Muscle recovery", "Increased caloric needs"],
    osmolality: 440,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "High protein", "Concentrated nutrition"],
  },
  {
    name: "Fresubin Protein Energy Fibre",
    brand: "Fresenius",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.075,
    description: "High-energy, high-protein formula with added fiber",
    indications: ["High protein needs", "Wound healing", "Bowel regulation", "Muscle support"],
    osmolality: 460,
    fiberContent: "6g per 200mL",
    specialFeatures: ["High calorie", "High protein", "Fiber-enriched", "Concentrated"],
  },
  {
    name: "Fresubin 2kcal Drink",
    brand: "Fresenius",
    caloriesPerMl: 2.0,
    proteinPerMl: 0.075,
    description: "Very high calorie enteral formula concentrate",
    indications: ["Severe fluid restriction", "Very high caloric needs"],
    osmolality: 610,
    fiberContent: "Fiber-free",
    specialFeatures: ["Very high calorie", "Concentrated", "Drinkable"],
  },

  // ===== NUTRIENT DENSE ENERGY FORMULAS =====
  {
    name: "Fortisip",
    brand: "Nutricia",
    caloriesPerMl: 2.0,
    proteinPerMl: 0.08,
    description: "Fortified, complete, ready-to-drink high-calorie nutritional supplement",
    indications: ["High caloric needs", "Fluid restriction", "Malnutrition", "Weight loss"],
    osmolality: 520,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie concentrate", "Ready-to-drink", "Complete nutrition", "Lactose-free"],
  },
  {
    name: "Fortisip Compact",
    brand: "Nutricia",
    caloriesPerMl: 2.4,
    proteinPerMl: 0.1,
    description: "Compact, very high-calorie ready-to-drink supplement in small volumes",
    indications: ["Severe fluid restriction", "Very high caloric needs", "Malnutrition"],
    osmolality: 620,
    fiberContent: "Fiber-free",
    specialFeatures: ["Very high calorie", "Compact portion", "Complete protein", "Concentrated"],
  },
  {
    name: "Fortisip Plus",
    brand: "Nutricia",
    caloriesPerMl: 2.4,
    proteinPerMl: 0.12,
    description: "High-calorie, high-protein nutritional supplement with extra protein",
    indications: ["High protein needs", "Muscle recovery", "Wound healing", "Malnutrition"],
    osmolality: 640,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "High protein", "Complete nutrition", "Concentrated"],
  },
  {
    name: "Fortisip Bottle",
    brand: "Nutricia",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "Ready-to-drink high-energy supplement in bottle format",
    indications: ["Moderate caloric needs", "Convenient nutrition", "Supplementary feeding"],
    osmolality: 380,
    fiberContent: "Fiber-free",
    specialFeatures: ["Convenient format", "High calorie", "Complete nutrition", "Lactose-free"],
  },
  {
    name: "Fortisip Fibre",
    brand: "Nutricia",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.06,
    description: "High-calorie supplement with added dietary fiber",
    indications: ["High caloric needs", "Constipation prevention", "Bowel health"],
    osmolality: 430,
    fiberContent: "3.75g per 200mL",
    specialFeatures: ["High calorie", "Fiber-enriched", "Multi-fiber blend", "Complete nutrition"],
  },

  // ===== BAXTER/APPLIED NUTRITION =====
  {
    name: "Isosource 1.5",
    brand: "Baxter",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.063,
    description: "Balanced nutrition formula with higher calories",
    indications: ["Increased caloric needs", "Fluid restriction"],
    osmolality: 375,
    fiberContent: "Fiber-free",
    specialFeatures: ["Balanced nutrition", "High calorie", "MCT oil source"],
  },
  {
    name: "Isosource HN",
    brand: "Baxter",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.042,
    description: "High-nitrogen formula for increased protein needs",
    indications: ["High protein needs", "Wound healing", "Muscle support"],
    osmolality: 300,
    fiberContent: "Fiber-free",
    specialFeatures: ["High protein", "Nitrogen-rich", "Wound support"],
  },
  {
    name: "Isosource VHN",
    brand: "Baxter",
    caloriesPerMl: 1.2,
    proteinPerMl: 0.06,
    description: "Very high-nitrogen formula with concentrated protein",
    indications: ["Very high protein needs", "Critical care", "Trauma"],
    osmolality: 340,
    fiberContent: "Fiber-free",
    specialFeatures: ["Very high protein", "High calorie", "Concentrated nitrogen"],
  },

  // ===== ABBOTT ADDITIONAL FORMULAS =====
  {
    name: "Ensure High Protein",
    brand: "Abbott",
    caloriesPerMl: 1.1,
    proteinPerMl: 0.063,
    description: "Nutritionally complete ready-to-drink supplement with added protein",
    indications: ["High protein needs", "Muscle support", "Supplementary nutrition"],
    osmolality: 390,
    fiberContent: "Fiber-free",
    specialFeatures: ["High protein", "Ready-to-drink", "Complete nutrition"],
  },
  {
    name: "Ensure Plus",
    brand: "Abbott",
    caloriesPerMl: 1.5,
    proteinPerMl: 0.055,
    description: "High-calorie nutritional supplement for increased energy needs",
    indications: ["Increased caloric needs", "Weight management", "Malnutrition"],
    osmolality: 450,
    fiberContent: "Fiber-free",
    specialFeatures: ["High calorie", "Convenient format", "Complete nutrition"],
  },
  {
    name: "Ensure Fiber",
    brand: "Abbott",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.04,
    description: "Complete nutrition with added dietary fiber",
    indications: ["General nutrition", "Constipation prevention", "Bowel health"],
    osmolality: 345,
    fiberContent: "4g per 237mL",
    specialFeatures: ["Fiber-enriched", "Complete nutrition", "Bowel health support"],
  },
  {
    name: "Ensure Homestyle",
    brand: "Abbott",
    caloriesPerMl: 1.06,
    proteinPerMl: 0.04,
    description: "Whole food-style enteral nutrition supplement",
    indications: ["General nutrition", "Whole food preference", "Routine feeding"],
    osmolality: 350,
    fiberContent: "Fiber-free",
    specialFeatures: ["Whole food style", "Natural taste", "Balanced nutrition"],
  },

  // ===== MEAD JOHNSON FORMULAS =====
  {
    name: "Enfocus Lipil",
    brand: "Mead Johnson",
    caloriesPerMl: 0.67,
    proteinPerMl: 0.018,
    description: "Pediatric protein hydrolysate formula",
    indications: ["Pediatric patients", "Allergy", "Sensitive digestion"],
    osmolality: 280,
    fiberContent: "Fiber-free",
    specialFeatures: ["Pediatric formula", "Protein hydrolysate", "Easy to digest"],
  },
  {
    name: "Portagen",
    brand: "Mead Johnson",
    caloriesPerMl: 1.0,
    proteinPerMl: 0.035,
    description: "Formula with MCT oil for fat malabsorption",
    indications: ["Fat malabsorption", "Cystic fibrosis", "Pancreatic insufficiency"],
    osmolality: 300,
    fiberContent: "Fiber-free",
    specialFeatures: ["MCT oil", "Easy fat absorption", "Low lactose"],
  },
]

// Build a compact text representation of the formula database for the AI prompt
function buildFormulaDatabaseContext(): string {
  return ENTERAL_FORMULAS.map(
    (f) =>
      `${f.name} | ${f.brand} | ${f.caloriesPerMl} cal/mL | ${f.proteinPerMl} g protein/mL | ${f.description} | Indications: ${f.indications.join(", ")}${f.osmolality ? ` | Osmolality: ${f.osmolality}` : ""}${f.fiberContent ? ` | Fiber: ${f.fiberContent}` : ""}${f.specialFeatures ? ` | Features: ${f.specialFeatures.join(", ")}` : ""}`,
  ).join("\n")
}

const FORMULA_DATABASE_CONTEXT = buildFormulaDatabaseContext()

const SYSTEM_PROMPT = `You are an enteral nutrition formula search assistant. You help healthcare providers and caregivers find the right tube feeding formulas based on their search queries.

You have access to the following enteral formula database. You MUST ONLY return formulas that exist in this database. Do NOT invent or hallucinate formulas.

FORMULA DATABASE:
${FORMULA_DATABASE_CONTEXT}

INSTRUCTIONS:
- Analyze the user's search query to understand what they're looking for
- Return the most relevant formulas from the database (up to 5 results)
- Consider brand names, medical conditions, nutritional requirements, special features, and general descriptions
- If the query is vague, return a diverse set of relevant options
- If the query mentions a condition not directly listed, use your medical knowledge to match appropriate formulas
- Return the complete formula data exactly as it appears in the database
- Return formulas sorted by relevance to the query`

function textFallbackSearch(query: string) {
  const searchTerm = query.toLowerCase().trim()
  return ENTERAL_FORMULAS.filter((f) => {
    const searchable = [
      f.name,
      f.brand,
      f.description,
      ...f.indications,
      ...(f.specialFeatures || []),
      f.fiberContent || "",
    ]
      .join(" ")
      .toLowerCase()
    return searchable.includes(searchTerm)
  }).slice(0, 5)
}

export async function POST(request: Request) {
  let query: string

  try {
    const body = await request.json()
    query = body.query
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!query || query.trim().length === 0) {
    return Response.json({ error: "Search query is required" }, { status: 400 })
  }

  console.log("🔍 AI searching for:", query)

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: FormulaSchema,
      system: SYSTEM_PROMPT,
      prompt: `Search for enteral formulas matching: "${query}"`,
      maxRetries: 1,
    })

    // Validate that returned formulas actually exist in our database
    const validatedFormulas = object.formulas.filter((result) =>
      ENTERAL_FORMULAS.some((dbFormula) => dbFormula.name === result.name),
    )

    // Replace with database versions to guarantee accurate data
    const finalFormulas = validatedFormulas.map((result) => {
      const dbMatch = ENTERAL_FORMULAS.find((f) => f.name === result.name)
      return dbMatch ?? result
    })

    console.log("✅ AI search successful, found:", finalFormulas.length, "formulas")
    return Response.json({ formulas: finalFormulas })
  } catch (error) {
    console.error("❌ AI search failed, falling back to text search:", error)

    const results = textFallbackSearch(query)
    return Response.json({ formulas: results })
  }
}
