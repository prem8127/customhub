export type PremiumHeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  cta: {
    label: string;
    href: string;
  };
  eyebrow?: string;
  accent?: string;
  panelTone?: string;
};

export type Product360Frame =
  | string
  | {
      src: string;
      alt?: string;
    };

export type PreviewCategory = "tshirt" | "mobile" | "bike";
