import { SeverityCategory } from '../types.js';

export interface SeverityEstimate {
  percentage: number; // 0 - 100
  category: SeverityCategory;
  description: string;
  isEstimate: true;
}

export class SeverityService {
  /**
   * Evaluates severity percentage and maps to the standard categories:
   * 0-5%: Healthy
   * 5-15%: Mild
   * 15-35%: Moderate
   * >35%: Severe
   */
  public static categorize(percentage: number): SeverityCategory {
    if (percentage <= 5) return 'Healthy';
    if (percentage <= 15) return 'Mild';
    if (percentage <= 35) return 'Moderate';
    return 'Severe';
  }

  /**
   * Generates or extracts estimated affected leaf area.
   * Designed as an independent module that can be swapped with a deep-learning
   * UNet/DeepLab semantic segmentation model in future releases.
   */
  public static estimate(diseaseName: string, baseSeverityHint?: number): SeverityEstimate {
    let percentage: number;

    if (diseaseName.toLowerCase() === 'healthy') {
      percentage = baseSeverityHint !== undefined ? Math.min(4, Math.max(0, baseSeverityHint)) : 2;
    } else if (baseSeverityHint !== undefined && baseSeverityHint >= 0) {
      percentage = Math.min(100, Math.max(0, Math.round(baseSeverityHint)));
    } else {
      // Default heuristic calibration per disease class
      switch (diseaseName) {
        case 'Early Blight':
          percentage = 24;
          break;
        case 'Late Blight':
          percentage = 48;
          break;
        case 'Common Rust':
          percentage = 18;
          break;
        case 'Northern Leaf Blight':
          percentage = 32;
          break;
        default:
          percentage = 15;
      }
    }

    const category = this.categorize(percentage);
    let description: string;

    switch (category) {
      case 'Healthy':
        description = 'Negligible tissue compromise (<5%). Leaf maintains full photosynthetic integrity.';
        break;
      case 'Mild':
        description = `Superficial or localized lesion distribution (~${percentage}% leaf area). Readily manageable with cultural intervention.`;
        break;
      case 'Moderate':
        description = `Significant foliar involvement (~${percentage}% affected). High risk of accelerated chlorosis and defoliation if left unchecked.`;
        break;
      case 'Severe':
        description = `Extensive systemic or coalescing necrosis (~${percentage}% area affected). High risk to harvest yield and canopy collapse.`;
        break;
    }

    return {
      percentage,
      category,
      description,
      isEstimate: true
    };
  }
}
