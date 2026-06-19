export const FEATURES = {
  premiumHero: true,
  product360: true,
  product3D: false,
  aiPreview: true
};

export function isFeatureEnabled(feature) {
  return FEATURES[feature];
}
