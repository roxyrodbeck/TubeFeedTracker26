# Weight-Based Feeding Rate Calculator

## Overview

The Weight-Based Feeding Rate Calculator is a new feature added to the Tube Feed Tracker app that helps calculate personalized enteral nutrition requirements based on patient weight and BMI. This calculator follows the **UT Health Surgery Department's Enteral Nutrition Algorithm**.

## Features

### 1. **Weight-Based Caloric Needs Calculator**

Calculates daily caloric requirements based on patient body metrics:

- **Input Fields:**
  - Weight (kg) - patient's current weight
  - Height (cm) - patient's height (or BMI if available)
  - BMI (optional) - body mass index if already calculated

- **Calculation Method:**
  - **If BMI < 25 (normal weight):** 
    - Daily Calories = Actual Body Weight × 30 kcal/kg/day
  - **If BMI > 25 (overweight):** 
    - Daily Calories = (Ideal Body Weight + 10%) × 30 kcal/kg/day

- **Output:** Total daily caloric needs in kcal/day

### 2. **Goal Feeding Rate Calculator**

Calculates the target feeding rate (mL/hour) based on formula selection:

- **Formula Options:**
  - Standard Formula: 1.0 kcal/mL
  - Peptamen AF: 1.2 kcal/mL
  - Impact Peptide 1.5: 1.5 kcal/mL

- **Calculations:**
  - Total Daily Volume = Daily Calories ÷ Formula Calories/mL
  - Goal Rate (mL/hr) = Total Daily Volume ÷ 24 hours

- **Output:**
  - Goal feeding rate in mL/hour
  - Total volume needed per 24 hours

### 3. **Standard Feeding Protocol**

Displays the recommended advancement schedule:

- **Starting Protocol:**
  - Begin at 20 mL/hr
  - Advance by 20 mL every 4 hours until goal rate is reached

- **Timeline:**
  - Shows each advancement step with time and rate
  - Calculates hours to reach goal

- **Standard Water Flush:**
  - 30 mL every 4 hours (for tube site maintenance)

### 4. **Calculation Breakdown**

Provides step-by-step transparency of all calculations:

- **Patient Assessment:**
  - Weight, height, BMI, ideal body weight (if overweight)

- **Caloric Calculation:**
  - Shows the formula used and intermediate results

- **Volume & Rate Calculation:**
  - Breaks down the math from daily calories to hourly rate

### 5. **Medical Disclaimer**

Prominent disclaimer alerting users that:

- These calculations are for reference only
- Should not replace doctor's specific orders
- Always follow medical team's prescribed feeding plan
- Based on general medical guidelines
- Individual needs may vary by patient factors

## User Interface

### Layout

The calculator is accessible as a new tab ("Feeding Rate") in the main navigation:

- **Calculator Tab**: Original tube feed rate calculator
- **Feeding Rate Tab**: NEW - Weight-based calculator (with Scale icon)
- **Formulas Tab**: Formula database and information
- **Log Tab**: History of calculations

### Sections

All major sections are expandable/collapsible for mobile-friendly UX:

1. **Medical Disclaimer** - Always visible, expandable for details
2. **Patient Information** - Input form for weight, height, BMI, formula
3. **Calculation Breakdown** - Step-by-step math explanation
4. **Key Results** - Summary cards showing main outputs
5. **Feeding Protocol** - Advancement schedule
6. **Important Notes** - Clinical guidance

### Design

- **Color Coding:**
  - Red section: Medical disclaimer (alert)
  - Blue section: Calculation breakdown
  - Green section: Key results
  - Purple section: Feeding protocol
  - Gray section: Important notes

- **Responsive Design:**
  - Mobile-friendly with hidden labels on small screens
  - Touch-friendly buttons and inputs
  - Collapsible sections for space efficiency

- **Dark Mode Support:**
  - Full dark mode compatibility
  - Appropriate color adjustments for visibility

## How to Use

### Step 1: Enter Patient Information

1. Navigate to the "Feeding Rate" tab
2. Enter patient's weight in kilograms
3. Enter either height (cm) or BMI
4. Select the formula type
5. Read the medical disclaimer

### Step 2: Calculate

1. Click the "Calculate" button
2. Review the calculation breakdown (optional)
3. View key results

### Step 3: View Protocol

1. Expand the "Standard Feeding Protocol" section
2. Review the advancement schedule
3. Note the timeline to reach goal rate
4. Reference water flush schedule

### Step 4: Implement

1. Follow medical team's specific orders
2. Use the protocol as a reference guide
3. Monitor for signs of intolerance
4. Adjust based on clinical judgment

## Algorithm Details

### Ideal Body Weight (IBW) Calculation

Uses the simplified Devine formula adapted for metric units:

```
IBW = 48 kg + 2.3 kg per inch over 60 inches
(Converted to metric: 48 kg + 0.91 kg per cm over 152.4 cm)
```

This is used when BMI > 25 to account for excess body weight.

### Caloric Requirements

Based on UT Health Surgery Department guidelines:

- **Normal weight (BMI < 25):** Use actual body weight
- **Overweight (BMI > 25):** Use IBW + 10% (to account for obesity without over-feeding)
- **Multiplier:** 30 kcal/kg/day for enteral nutrition

### Rate Advancement

Standard protocol:
- Start: 20 mL/hr
- Advance: +20 mL/hr every 4 hours
- Maximum tolerance typically 24-48 hours to goal rate
- Assumes good tolerance without interruption

## Clinical Notes

### When to Use This Calculator

✓ Initial feeding plan establishment  
✓ Adjusting goals for stable patients  
✓ Educational tool for families  
✓ Reference for consistency checking  

### When to Consult Healthcare Provider

✗ For specific medical orders (always use prescribed rates)  
✗ For patients with special medical conditions  
✗ For tolerance issues or complications  
✗ For adjustments during illness  

### Factors This Calculator Does NOT Account For

- Individual metabolic variations
- Medical conditions (renal disease, diabetes, etc.)
- Medications affecting metabolism
- Functional status changes
- Acute illness or stress
- GI intolerance or complications
- Electrolyte imbalances
- Liver or kidney disease

## Integration with Existing Features

The calculator integrates seamlessly with existing Tube Feed Tracker features:

- **Complementary to Basic Calculator:** 
  - Basic calculator: Rate calculations (mL ÷ hours)
  - Feeding Rate Calculator: Weight-based needs assessment

- **Formula Consistency:**
  - Same formula database
  - Consistent caloric values across app

- **Responsive Design:**
  - Maintains existing styling and theme
  - Uses same UI components
  - Dark mode support

## Technical Implementation

### Component Structure

```
FeedingRateCalculator
├── Medical Disclaimer Section
├── Input Form
│   ├── Weight input
│   ├── Height input
│   ├── BMI input
│   └── Formula selector
├── Calculation Breakdown
├── Key Results Display
├── Feeding Protocol Timeline
├── Important Notes
```

### State Management

- `weight`, `height`, `bmi`: Patient metrics
- `selectedFormula`: Formula type (standard/peptamenAF/impactPeptide)
- `calculation`: FeedingCalculation object with computed values
- `protocol`: Array of ProtocolStep objects
- `expandedSection`: Which section is currently expanded
- `activeStep`: Highlighted protocol step

### Key Calculations

```typescript
BMI = weight / (height in meters)²
IBW = 48 + (height - 152.4) × 0.91  // Simplified Devine
DailyCalories = weight × 30 (if BMI < 25)
            OR = (IBW × 1.1) × 30 (if BMI > 25)
DailyVolume = DailyCalories / formulaCaloriesPerMl
GoalRate = DailyVolume / 24
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App (PWA) support
- Offline capability

## Future Enhancements

Potential improvements for future versions:

1. **PDF Export:** Generate printable feeding plans
2. **Pediatric Calculator:** Age-adjusted calculations
3. **Multiple Formula Support:** More formula options
4. **Tolerance Tracking:** Log advancement adherence
5. **Historical Trends:** Track weight/calorie changes over time
6. **Notifications:** Reminders for advancement steps
7. **Cloud Sync:** Save calculations across devices
8. **Multi-patient Support:** Manage multiple patients

## References

- UT Health Surgery Department's Enteral Nutrition Algorithm
- American Society for Parenteral and Enteral Nutrition (ASPEN) Guidelines
- Hospital for Special Surgery (HSS) Nutrition Guidelines
- Evidence-based enteral nutrition practices

## Support & Disclaimers

**This calculator is for educational and reference purposes only.**

- Not a substitute for professional medical advice
- Always consult with healthcare providers
- Follow prescribed feeding plans from medical team
- Individual patient needs may vary significantly
- Medical professionals should validate all calculations

For questions or issues, please contact the development team.

---

**Version:** 1.0  
**Last Updated:** November 2024  
**Author:** Roxana Rodriguez-Becker  
**License:** As per Tube Feed Tracker project license
