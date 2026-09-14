export interface WeatherConditions {
  location?: string;
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  recordedAt: string;
}

export interface DiseaseRiskContext {
  crop: string;
  disease: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  contextualObservation: string;
  recommendation: string;
  conditionsUsed: WeatherConditions;
}

export interface IWeatherService {
  getCurrentConditions(location?: string): Promise<WeatherConditions>;
  evaluateDiseaseRiskContext(crop: string, disease: string, location?: string): Promise<DiseaseRiskContext>;
}

/**
 * WeatherService abstraction allowing future external weather APIs (OpenWeather, NOAA, AgroClimatic)
 * without altering downstream prediction or UI modules.
 */
export class WeatherService implements IWeatherService {
  public async getCurrentConditions(location = 'Central Agricultural Valley'): Promise<WeatherConditions> {
    // Current ambient conditions simulator / default representative microclimate
    return {
      location,
      temperatureC: 22.5,
      humidityPercent: 78,
      rainfallMm: 3.2,
      recordedAt: new Date().toISOString()
    };
  }

  public async evaluateDiseaseRiskContext(
    crop: string,
    disease: string,
    location = 'Field Zone A'
  ): Promise<DiseaseRiskContext> {
    const conditions = await this.getCurrentConditions(location);
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    let contextualObservation = 'Ambient conditions are within nominal ranges for crop canopy development.';
    let recommendation = 'Standard morning scouting protocol is recommended.';

    const normDisease = disease.toLowerCase();

    if (normDisease.includes('late blight')) {
      // Late blight favors cool humid weather: temp 15-22°C and humidity > 75%
      if (conditions.temperatureC >= 15 && conditions.temperatureC <= 23 && conditions.humidityPercent >= 75) {
        riskLevel = 'HIGH';
        contextualObservation = `Current temperature (${conditions.temperatureC}°C) and elevated relative humidity (${conditions.humidityPercent}%) reflect favorable microclimate parameters for Phytophthora sporulation.`;
        recommendation = 'Inspect dense lower canopies immediately; delay overhead irrigation to facilitate foliage drying.';
      } else {
        riskLevel = 'MODERATE';
      }
    } else if (normDisease.includes('early blight')) {
      // Alternaria favors warm conditions (24-29°C) with alternating wet/dry
      if (conditions.temperatureC >= 22 && conditions.humidityPercent >= 65) {
        riskLevel = 'MODERATE';
        contextualObservation = `Warm ambient temperatures (${conditions.temperatureC}°C) with intermittent leaf moisture create conducive conditions for Alternaria spore germination.`;
        recommendation = 'Maintain protective mulch barrier; monitor lower foliage for concentric target-spot lesions.';
      }
    } else if (normDisease.includes('rust')) {
      // Common rust favors 16-25°C and high humidity/dew
      if (conditions.temperatureC >= 16 && conditions.temperatureC <= 26 && conditions.humidityPercent >= 70) {
        riskLevel = 'HIGH';
        contextualObservation = `Ambient conditions (${conditions.temperatureC}°C, ${conditions.humidityPercent}% RH) align with conditions supporting Puccinia spore dispersal.`;
        recommendation = 'Check mid-canopy ear leaves for raised cinnamon-brown pustules before grain fill.';
      }
    } else if (normDisease.includes('northern leaf blight')) {
      if (conditions.humidityPercent >= 75) {
        riskLevel = 'MODERATE';
        contextualObservation = `Prolonged humidity (${conditions.humidityPercent}%) provides sufficient surface dew duration for Exserohilum conidia germination.`;
        recommendation = 'Scout lower canopy for early elliptical water-soaked lesions.';
      }
    }

    return {
      crop,
      disease,
      riskLevel,
      contextualObservation,
      recommendation,
      conditionsUsed: conditions
    };
  }
}

export const weatherServiceInstance = new WeatherService();
