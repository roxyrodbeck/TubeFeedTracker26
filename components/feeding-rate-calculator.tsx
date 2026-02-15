"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/info-tooltip"
import { AlertCircle, Calculator, ChevronDown, ChevronUp } from "lucide-react"

interface FeedingCalculation {
  weight: number
  height: number
  bmi: number
  isOverweight: boolean
  idealBodyWeight: number
  dailyCalories: number
  formulaCaloriesPerMl: number
  goalRatePerHour: number
  totalDailyVolume: number
  hoursToReachGoal: number
}

interface WeightConversion {
  pounds: number
  kilograms: number
}

interface ProtocolStep {
  step: number
  time: string
  rate: string
  action: string
}

const FORMULA_OPTIONS = {
  standard: { name: "Standard Formula (1.0 cal/mL)", caloriesPerMl: 1.0 },
  peptamenAF: { name: "Peptamen AF (1.2 cal/mL)", caloriesPerMl: 1.2 },
  impactPeptide: { name: "Impact Peptide 1.5 (1.5 cal/mL)", caloriesPerMl: 1.5 },
}

export function FeedingRateCalculator() {
  const [weight, setWeight] = useState("")
  const [weightInPounds, setWeightInPounds] = useState("")
  const [height, setHeight] = useState("")
  const [heightInInches, setHeightInInches] = useState("")
  const [bmi, setBmi] = useState("")
  const [selectedFormula, setSelectedFormula] = useState<keyof typeof FORMULA_OPTIONS>("standard")
  const [calculation, setCalculation] = useState<FeedingCalculation | null>(null)
  const [protocol, setProtocol] = useState<ProtocolStep[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>("disclaimer")
  const [activeStep, setActiveStep] = useState<number | null>(null)

  // Convert pounds to kilograms
  const handlePoundsChange = (pounds: string) => {
    setWeightInPounds(pounds)
    if (pounds && Number.parseFloat(pounds) > 0) {
      const kg = (Number.parseFloat(pounds) / 2.20462).toFixed(2)
      setWeight(kg)
    } else {
      setWeight("")
    }
  }

  // Convert kilograms to pounds
  const handleKgChange = (kg: string) => {
    setWeight(kg)
    if (kg && Number.parseFloat(kg) > 0) {
      const lbs = (Number.parseFloat(kg) * 2.20462).toFixed(2)
      setWeightInPounds(lbs)
    } else {
      setWeightInPounds("")
    }
  }

  // Convert centimeters to inches
  const handleInchesChange = (inches: string) => {
    setHeightInInches(inches)
    if (inches && Number.parseFloat(inches) > 0) {
      const cm = (Number.parseFloat(inches) * 2.54).toFixed(1)
      setHeight(cm)
    } else {
      setHeight("")
    }
  }

  // Convert centimeters to inches
  const handleCmChange = (cm: string) => {
    setHeight(cm)
    if (cm && Number.parseFloat(cm) > 0) {
      const inches = (Number.parseFloat(cm) / 2.54).toFixed(2)
      setHeightInInches(inches)
    } else {
      setHeightInInches("")
    }
  }

  const calculateBMI = (w: number, h: number): number => {
    // BMI = weight (kg) / height (m)²
    const heightInMeters = h / 100
    return w / (heightInMeters * heightInMeters)
  }

  const calculateIdealBodyWeight = (h: number): number => {
    // Simplified Devine formula for IBW
    // Men: 50 kg + 2.3 kg for each inch over 60 inches
    // Women: 45.5 kg + 2.3 kg for each inch over 60 inches
    // Average: 48 kg + 2.3 kg per inch over 60 inches
    const inchesOver60 = h - 60
    return 48 + inchesOver60 * 0.91 // 0.91 ≈ 2.3 kg per inch converted to metric
  }

  const generateProtocol = (goalRate: number): ProtocolStep[] => {
    const steps: ProtocolStep[] = []
    const startRate = 20
    const incrementPerStep = 20
    const hoursPerStep = 4
    let currentRate = startRate
    let currentHours = 0

    // Add starting rate
    steps.push({
      step: 1,
      time: "Hour 0",
      rate: `${startRate} mL/hr`,
      action: "Start feeding",
    })

    // Generate advance schedule
    let stepNum = 2
    while (currentRate < goalRate) {
      currentHours += hoursPerStep
      currentRate += incrementPerStep

      if (currentRate > goalRate) {
        currentRate = goalRate
      }

      steps.push({
        step: stepNum,
        time: `Hour ${currentHours}`,
        rate: `${currentRate} mL/hr`,
        action: currentRate === goalRate ? "Goal rate reached" : "Advance rate",
      })

      stepNum++
    }

    // Add water flush info as final step
    steps.push({
      step: stepNum,
      time: "Every 4 hours",
      rate: "30 mL",
      action: "Water flush",
    })

    return steps
  }

  const handleCalculate = () => {
    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height)
    const bmiNum = Number.parseFloat(bmi)

    // Validate inputs
    if (!weightNum || weightNum <= 0) {
      alert("Please enter a valid weight")
      return
    }

    if (!heightNum && !bmiNum) {
      alert("Please enter either height or BMI")
      return
    }

    let calculatedBMI = bmiNum
    let calculatedHeight = heightNum

    // If only height is provided, calculate BMI
    if (!bmiNum && heightNum) {
      calculatedBMI = calculateBMI(weightNum, heightNum)
      calculatedHeight = heightNum
    }

    // If only BMI is provided, estimate height (for reference)
    if (!heightNum && bmiNum) {
      calculatedHeight = Math.sqrt((weightNum * 10000) / bmiNum)
    }

    const isOverweight = calculatedBMI > 25
    const formulaInfo = FORMULA_OPTIONS[selectedFormula]

    let dailyCals: number
    let ibw: number

    if (isOverweight) {
      // If BMI >25: (ideal body weight + 10%) × 30 kcal/kg/day
      ibw = calculateIdealBodyWeight(calculatedHeight)
      const adjustedIBW = ibw * 1.1
      dailyCals = adjustedIBW * 30
    } else {
      // If BMI <25: actual body weight × 30 kcal/kg/day
      dailyCals = weightNum * 30
      ibw = calculateIdealBodyWeight(calculatedHeight)
    }

    const totalDailyVolume = dailyCals / formulaInfo.caloriesPerMl
    const goalRate = totalDailyVolume / 24

    const protocolSteps = generateProtocol(goalRate)

    const calculationData: FeedingCalculation = {
      weight: weightNum,
      height: calculatedHeight,
      bmi: calculatedBMI,
      isOverweight,
      idealBodyWeight: ibw,
      dailyCalories: dailyCals,
      formulaCaloriesPerMl: formulaInfo.caloriesPerMl,
      goalRatePerHour: goalRate,
      totalDailyVolume,
      hoursToReachGoal: 0, // Will be calculated from protocol
    }

    // Calculate hours to reach goal
    if (protocolSteps.length > 1) {
      const lastAdvanceStep = protocolSteps[protocolSteps.length - 2] // Before water flush
      const timeStr = lastAdvanceStep.time.replace("Hour ", "")
      calculationData.hoursToReachGoal = Number.parseInt(timeStr)
    }

    setCalculation(calculationData)
    setProtocol(protocolSteps)
    setExpandedSection("results")
  }

  const handleReset = () => {
    setWeight("")
    setWeightInPounds("")
    setHeight("")
    setHeightInInches("")
    setBmi("")
    setCalculation(null)
    setProtocol([])
    setExpandedSection("disclaimer")
    setActiveStep(null)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Medical Disclaimer */}
      <div>
        <button
          onClick={() => toggleSection("disclaimer")}
          className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="font-medium text-red-900 dark:text-red-200">Medical Disclaimer</span>
          </div>
          {expandedSection === "disclaimer" ? (
            <ChevronUp className="h-5 w-5 text-red-600 dark:text-red-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
        </button>

        {expandedSection === "disclaimer" && (
          <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <Alert className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-900 dark:text-red-200">Important - For Reference Only</AlertTitle>
              <AlertDescription className="text-red-800 dark:text-red-300 mt-2 space-y-2">
                <p>
                  <strong>These calculations are based on general medical guidelines and should not replace your
                    doctor's specific orders.</strong>
                </p>
                <p>Always follow your medical team's prescribed feeding plan.</p>
                <p className="text-sm">
                  This calculator uses the UT Health Surgery Department's Enteral Nutrition Algorithm as a reference.
                  Actual nutritional needs may vary based on individual patient factors, medical conditions, and
                  clinical judgment. Consult with your healthcare provider before making any changes to feeding plans.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight:
              </label>
              <InfoTooltip content="Enter weight in kilograms or pounds. The values will convert automatically." />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="weight-kg" className="text-xs text-gray-600 dark:text-gray-400">
                  Kilograms (kg)
                </label>
                <input
                  id="weight-kg"
                  type="number"
                  value={weight}
                  onChange={(e) => handleKgChange(e.target.value)}
                  placeholder="e.g., 70"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="weight-lbs" className="text-xs text-gray-600 dark:text-gray-400">
                  Pounds (lbs)
                </label>
                <input
                  id="weight-lbs"
                  type="number"
                  value={weightInPounds}
                  onChange={(e) => handlePoundsChange(e.target.value)}
                  placeholder="e.g., 154"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Enter weight in either unit and it will auto-convert
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height:
              </label>
              <InfoTooltip content="Enter height in centimeters or inches. The values will convert automatically. Leave blank if using BMI instead." />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="height-cm" className="text-xs text-gray-600 dark:text-gray-400">
                  Centimeters (cm)
                </label>
                <input
                  id="height-cm"
                  type="number"
                  value={height}
                  onChange={(e) => handleCmChange(e.target.value)}
                  placeholder="e.g., 170"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="height-inches" className="text-xs text-gray-600 dark:text-gray-400">
                  Inches (in)
                </label>
                <input
                  id="height-inches"
                  type="number"
                  value={heightInInches}
                  onChange={(e) => handleInchesChange(e.target.value)}
                  placeholder="e.g., 67"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Enter height in either unit and it will auto-convert
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label htmlFor="bmi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                BMI (optional):
              </label>
              <InfoTooltip content="If you already have the BMI calculated, enter it here. Otherwise, leave blank." />
            </div>
            <input
              id="bmi"
              type="number"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
              placeholder="e.g., 24.2"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label htmlFor="formula" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Formula Type:
              </label>
              <InfoTooltip content="Select the enteral nutrition formula that will be used." />
            </div>
            <select
              id="formula"
              value={selectedFormula}
              onChange={(e) => setSelectedFormula(e.target.value as keyof typeof FORMULA_OPTIONS)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(FORMULA_OPTIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={handleCalculate} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              Calculate
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {calculation && (
        <div className="space-y-4">
          {/* Calculation Breakdown */}
          <button
            onClick={() => toggleSection("breakdown")}
            className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="font-medium text-blue-900 dark:text-blue-200">Calculation Breakdown</span>
            {expandedSection === "breakdown" ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {expandedSection === "breakdown" && (
            <Card className="bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Patient Assessment:</p>
                  <div className="pl-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Weight:</span> {calculation.weight} kg
                    </p>
                    <p>
                      <span className="font-medium">Height:</span> {calculation.height.toFixed(1)} cm
                    </p>
                    <p>
                      <span className="font-medium">BMI:</span> {calculation.bmi.toFixed(1)}{" "}
                      {calculation.isOverweight ? "(Overweight)" : "(Normal)"}
                    </p>
                    {calculation.isOverweight && (
                      <p>
                        <span className="font-medium">Ideal Body Weight:</span> {calculation.idealBodyWeight.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-blue-200 dark:border-blue-800 pt-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Caloric Calculation:</p>
                  <div className="pl-4 space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                    {calculation.isOverweight ? (
                      <p>
                        Formula: (IBW + 10%) × 30 kcal/kg/day = ({calculation.idealBodyWeight.toFixed(1)} + 10%) × 30 ={" "}
                        <span className="font-medium">{calculation.dailyCalories.toFixed(0)} kcal/day</span>
                      </p>
                    ) : (
                      <p>
                        Formula: Actual Weight × 30 kcal/kg/day = {calculation.weight} × 30 ={" "}
                        <span className="font-medium">{calculation.dailyCalories.toFixed(0)} kcal/day</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-blue-200 dark:border-blue-800 pt-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Volume & Rate Calculation:</p>
                  <div className="pl-4 space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                    <p>
                      Total Volume: {calculation.dailyCalories.toFixed(0)} kcal ÷{" "}
                      {calculation.formulaCaloriesPerMl} kcal/mL ={" "}
                      <span className="font-medium">{calculation.totalDailyVolume.toFixed(0)} mL/24hr</span>
                    </p>
                    <p>
                      Goal Rate: {calculation.totalDailyVolume.toFixed(0)} mL ÷ 24 hours ={" "}
                      <span className="font-medium">{calculation.goalRatePerHour.toFixed(1)} mL/hr</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Results */}
          <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100 text-lg">Key Results</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Caloric Needs</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {calculation.dailyCalories.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">kcal/day</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Volume</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {calculation.totalDailyVolume.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">mL/24 hours</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Goal Feeding Rate</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {calculation.goalRatePerHour.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">mL/hour</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Time to Goal</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {calculation.hoursToReachGoal}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">hours</p>
              </div>
            </CardContent>
          </Card>

          {/* Feeding Protocol */}
          <button
            onClick={() => toggleSection("protocol")}
            className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="font-medium text-purple-900 dark:text-purple-200">Standard Feeding Protocol</span>
            {expandedSection === "protocol" ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {expandedSection === "protocol" && (
            <Card className="bg-purple-50 dark:bg-purple-900/10">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-100 text-base">
                  Advancement Schedule (Every 4 Hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {protocol.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(activeStep === index ? null : index)}
                      className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {step.time}: {step.rate}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{step.action}</p>
                        </div>
                        {step.step === protocol.length && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded font-medium">
                            Every 4h
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm text-purple-900 dark:text-purple-200">
                    <span className="font-semibold">Note:</span> Standard water flush is 30 mL every 4 hours. Individual
                    protocols may vary based on clinical judgment and patient tolerance.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <Card className="bg-gray-50 dark:bg-gray-900/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-base">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <ul className="list-disc pl-5 space-y-2">
                <li>This calculation follows the UT Health Surgery Department's Enteral Nutrition Algorithm</li>
                <li>Actual feeding rates may need adjustment based on patient tolerance and clinical assessment</li>
                <li>Monitor for signs of intolerance: nausea, vomiting, abdominal distension, or diarrhea</li>
                <li>Always follow your medical team's specific orders and protocols</li>
                <li>Individual nutritional needs may vary; this is a guideline only</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
