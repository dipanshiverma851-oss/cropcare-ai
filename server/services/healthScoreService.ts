import { HealthScoreStatus } from '../types.js';

export interface HealthScoreResult {
  score: number; // 0 - 100
  status: HealthScoreStatus;
  trendAdjustment: number;
  breakdown: {
    baselineScore: number;
    severityDeduction: number;
    confidenceWeightPenalty: number;
    trendBonusOrPenalty: number;
  };
}

export class HealthScoreService {
  /**
   * Status bands:
   * 90-100: Healthy
   * 70-89: Good
   * 50-69: Needs Attention
   * 30-49: High Risk
   * 0-29: Critical
   */
  public static getStatus(score: number): HealthScoreStatus {
    if (score >= 90) return 'Healthy';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Attention';
    if (score >= 30) return 'High Risk';
    return 'Critical';
  }

  /**
   * Calculates dynamic health score:
   * - If Healthy: Base score 96, slight variance with minor leaf blemish
   * - If Diseased: Starts at 90, deducts based on affected area percentage * severity factor,
   *   weighted by confidence, and influenced by prior historical scan trend if available.
   */
  public static calculate(
    isHealthy: boolean,
    severityPercent: number,
    confidence: number,
    recentTrendDelta?: number // e.g. -5 if condition is deteriorating, +5 if improving
  ): HealthScoreResult {
    if (isHealthy) {
      const deduction = Math.min(6, Math.max(0, Math.round(severityPercent * 1.2)));
      const finalScore = Math.max(90, Math.min(100, 98 - deduction));
      return {
        score: finalScore,
        status: this.getStatus(finalScore),
        trendAdjustment: 0,
        breakdown: {
          baselineScore: 98,
          severityDeduction: deduction,
          confidenceWeightPenalty: 0,
          trendBonusOrPenalty: 0
        }
      };
    }

    // Diseased calculation
    const baseline = 88;
    // Severity impact: up to 55 points deduction for severe (>50% affected)
    const severityDeduction = Math.round(Math.min(60, (severityPercent / 100) * 70));

    // High confidence in disease means we penalize more definitely; low confidence dampens slightly
    const confidenceWeightPenalty = Math.round((confidence - 0.5) * 8);

    // Trend impact (recent scans getting worse vs recovering)
    let trendBonusOrPenalty = 0;
    if (recentTrendDelta !== undefined) {
      // If previous severity was lower than current (worsening), penalize by up to 5 points
      if (recentTrendDelta > 0) {
        trendBonusOrPenalty = -Math.min(5, Math.round(recentTrendDelta * 0.3));
      } else if (recentTrendDelta < 0) {
        trendBonusOrPenalty = Math.min(5, Math.round(Math.abs(recentTrendDelta) * 0.3));
      }
    }

    let rawScore = baseline - severityDeduction - confidenceWeightPenalty + trendBonusOrPenalty;
    const finalScore = Math.max(5, Math.min(85, Math.round(rawScore)));

    return {
      score: finalScore,
      status: this.getStatus(finalScore),
      trendAdjustment: trendBonusOrPenalty,
      breakdown: {
        baselineScore: baseline,
        severityDeduction,
        confidenceWeightPenalty,
        trendBonusOrPenalty
      }
    };
  }
}
