export const FEATURES = {
  premiumHero: true,
  product360: true,
  product3D: false,
  aiPreview: true
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(feature: FeatureKey) {
  return FEATURES[feature];
}
