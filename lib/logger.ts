"use client"

import { createClient } from "@/lib/supabase/client"

export interface CalculationLog {
  id: string
  timestamp: string
  sessionId: string
  userId?: string
  calculationType: "feed_rate" | "total_volume" | "total_hours"
  inputs: {
    milliliters?: number
    hours?: number
    milPerHour?: number
  }
  outputs: {
    milliliters?: number
    hours?: number
    milPerHour?: number
  }
  selectedFormula?: {
    name: string
    brand: string
    caloriesPerMl: number
    totalCalories?: number
  }
  duration?: number
}

export interface FormulaSearchLog {
  id: string
  timestamp: string
  sessionId: string
  userId?: string
  searchQuery: string
  resultsCount: number
  selectedFormula?: string
  searchDuration?: number
}

export interface SessionLog {
  sessionId: string
  userId?: string
  startTime: string
  endTime?: string
  totalCalculations: number
  totalSearches: number
  uniqueFormulasUsed: string[]
}

class ClientLogger {
  private supabase = createClient()

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      return user?.id ?? null
    } catch {
      return null
    }
  }

  private saveToLocalStorage(key: string, data: any) {
    try {
      const existing = localStorage.getItem(key)
      const logs = existing ? JSON.parse(existing) : []
      logs.push({
        ...data,
        id: data.id || this.generateId(),
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem(key, JSON.stringify(logs))
      return data
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      return data
    }
  }

  async logCalculation(data: Omit<CalculationLog, "id" | "timestamp">): Promise<CalculationLog> {
    const userId = await this.getUserId()

    if (userId) {
      try {
        await this.supabase.from("calculation_logs").insert({
          user_id: userId,
          session_id: data.sessionId,
          calculation_type: data.calculationType,
          inputs: data.inputs,
          outputs: data.outputs,
          selected_formula: data.selectedFormula || null,
          duration: data.duration || null,
        })
      } catch (error) {
        console.error("Error saving calculation to Supabase:", error)
        this.saveToLocalStorage("tube-feed-calculations", data)
      }
    } else {
      this.saveToLocalStorage("tube-feed-calculations", data)
    }

    console.log("Calculation logged:", data)
    return data as CalculationLog
  }

  async logFormulaSearch(data: Omit<FormulaSearchLog, "id" | "timestamp">): Promise<FormulaSearchLog> {
    const userId = await this.getUserId()

    if (userId) {
      try {
        await this.supabase.from("formula_search_logs").insert({
          user_id: userId,
          session_id: data.sessionId,
          search_query: data.searchQuery,
          results_count: data.resultsCount,
          selected_formula: data.selectedFormula || null,
          search_duration: data.searchDuration || null,
        })
      } catch (error) {
        console.error("Error saving search to Supabase:", error)
        this.saveToLocalStorage("tube-feed-searches", data)
      }
    } else {
      this.saveToLocalStorage("tube-feed-searches", data)
    }

    console.log("Search logged:", data)
    return data as FormulaSearchLog
  }

  logSession(data: Omit<SessionLog, "startTime">): SessionLog {
    const sessionData = {
      ...data,
      startTime: new Date().toISOString(),
    }
    // Sessions are lightweight — keep in localStorage only
    this.saveToLocalStorage("tube-feed-sessions", sessionData)
    console.log("Session logged:", sessionData)
    return sessionData as SessionLog
  }

  async getCalculationLogs(): Promise<CalculationLog[]> {
    const userId = await this.getUserId()

    if (userId) {
      try {
        const { data, error } = await this.supabase
          .from("calculation_logs")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false })

        if (error) throw error

        return (data || []).map((row: any) => ({
          id: row.id,
          timestamp: row.timestamp,
          sessionId: row.session_id,
          userId: row.user_id,
          calculationType: row.calculation_type,
          inputs: row.inputs,
          outputs: row.outputs,
          selectedFormula: row.selected_formula,
          duration: row.duration,
        }))
      } catch (error) {
        console.error("Error loading from Supabase:", error)
      }
    }

    // Fallback to localStorage
    try {
      const calculations = JSON.parse(localStorage.getItem("tube-feed-calculations") || "[]")
      return calculations.sort(
        (a: CalculationLog, b: CalculationLog) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch {
      return []
    }
  }

  async clearCalculationLogs(): Promise<void> {
    const userId = await this.getUserId()

    if (userId) {
      try {
        const { error } = await this.supabase
          .from("calculation_logs")
          .delete()
          .eq("user_id", userId)

        if (error) throw error
        return
      } catch (error) {
        console.error("Error clearing Supabase logs:", error)
      }
    }

    localStorage.removeItem("tube-feed-calculations")
  }

  async getCalculationStats(days = 7) {
    const userId = await this.getUserId()
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    let recentCalculations: CalculationLog[] = []
    let recentSearches: FormulaSearchLog[] = []

    if (userId) {
      try {
        const { data: calcData } = await this.supabase
          .from("calculation_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("timestamp", cutoffDate.toISOString())

        recentCalculations = (calcData || []).map((row: any) => ({
          id: row.id,
          timestamp: row.timestamp,
          sessionId: row.session_id,
          calculationType: row.calculation_type,
          inputs: row.inputs,
          outputs: row.outputs,
          selectedFormula: row.selected_formula,
          duration: row.duration,
        }))

        const { data: searchData } = await this.supabase
          .from("formula_search_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("timestamp", cutoffDate.toISOString())

        recentSearches = (searchData || []).map((row: any) => ({
          id: row.id,
          timestamp: row.timestamp,
          sessionId: row.session_id,
          searchQuery: row.search_query,
          resultsCount: row.results_count,
          selectedFormula: row.selected_formula,
          searchDuration: row.search_duration,
        }))
      } catch (error) {
        console.error("Error loading stats from Supabase:", error)
      }
    }

    // If no Supabase data, try localStorage
    if (recentCalculations.length === 0 && !userId) {
      try {
        const calculations = JSON.parse(localStorage.getItem("tube-feed-calculations") || "[]")
        const searches = JSON.parse(localStorage.getItem("tube-feed-searches") || "[]")

        recentCalculations = calculations.filter(
          (calc: CalculationLog) => new Date(calc.timestamp) > cutoffDate
        )
        recentSearches = searches.filter(
          (search: FormulaSearchLog) => new Date(search.timestamp) > cutoffDate
        )
      } catch {
        // ignore
      }
    }

    const stats = {
      totalCalculations: recentCalculations.length,
      totalSearches: recentSearches.length,
      popularFormulas: {} as Record<string, number>,
      calculationTypes: {} as Record<string, number>,
      dailyUsage: {} as Record<string, number>,
    }

    recentCalculations.forEach((calc: CalculationLog) => {
      const date = calc.timestamp.split("T")[0]
      stats.dailyUsage[date] = (stats.dailyUsage[date] || 0) + 1
      stats.calculationTypes[calc.calculationType] = (stats.calculationTypes[calc.calculationType] || 0) + 1

      if (calc.selectedFormula) {
        stats.popularFormulas[calc.selectedFormula.name] =
          (stats.popularFormulas[calc.selectedFormula.name] || 0) + 1
      }
    })

    return stats
  }
}

export const logger = new ClientLogger()
