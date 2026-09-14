export interface SampleLeaf {
  id: string;
  crop: string;
  expectedDisease: string;
  title: string;
  description: string;
  // High quality representative crop leaf photos
  imageUrl: string;
}

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: 'sample_tomato_early_blight',
    crop: 'Tomato',
    expectedDisease: 'Early Blight',
    title: 'Tomato - Concentric Bullseye Blight',
    description: 'Lower foliage showing distinct dark circular necrotic lesions with surrounding chlorotic halo.',
    imageUrl: '/samples/tomato_early_blight.jpg'
  },
  {
    id: 'sample_tomato_healthy',
    crop: 'Tomato',
    expectedDisease: 'Healthy',
    title: 'Tomato - Healthy Foliage',
    description: 'Vibrant green leaves with crisp margins and uninterrupted vein architecture.',
    imageUrl: '/samples/tomato_healthy.jpg'
  },
  {
    id: 'sample_potato_late_blight',
    crop: 'Potato',
    expectedDisease: 'Late Blight',
    title: 'Potato - Water-Soaked Late Blight',
    description: 'Extensive dark purplish lesions with water-soaked edges on mature potato vine leaf.',
    imageUrl: '/samples/potato_late_blight.jpg'
  },
  {
    id: 'sample_corn_common_rust',
    crop: 'Corn',
    expectedDisease: 'Common Rust',
    title: 'Corn - Rust Pustules',
    description: 'Powdery cinnamon-brown pustules erupting across upper leaf surface of maize.',
    imageUrl: '/samples/corn_common_rust.jpg'
  }
];
