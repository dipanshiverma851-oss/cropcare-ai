import { Crop } from '../types.js';

export const SUPPORTED_CROPS: Crop[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    description: 'High-value horticultural nightshade crop sensitive to early and late fungal blights.',
    supportedDiseases: ['Healthy', 'Early Blight', 'Late Blight'],
    icon: '🍅'
  },
  {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    description: 'Staple tuber crop susceptible to foliar defoliation and tuber blight rot.',
    supportedDiseases: ['Healthy', 'Early Blight', 'Late Blight'],
    icon: '🥔'
  },
  {
    id: 'corn',
    name: 'Corn',
    scientificName: 'Zea mays',
    description: 'Cereal grain crop vulnerable to common rust pustules and northern leaf blight lesions.',
    supportedDiseases: ['Healthy', 'Common Rust', 'Northern Leaf Blight'],
    icon: '🌽'
  }
];
