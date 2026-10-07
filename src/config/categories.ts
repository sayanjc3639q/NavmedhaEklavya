export interface CategoryConfig {
  id: "reels" | "photography" | "content" | "artworks";
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  description: string;
  guidelines: string[];
  acceptedFormats: string;
  maxSizeMB: number;
}

export const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  reels: {
    id: "reels",
    title: "Reels & Motion",
    subtitle: "Short Videos, Cinematics & Festive Moments",
    icon: "/assets/reelsmakingicon.png",
    accent: "#b45309",
    description: "Capture the beats of dhak, the fervor of sindoor khela, pandal hopping vibes or artistic editing in 60-90s reels.",
    guidelines: [
      "Duration: 30 to 90 seconds max.",
      "Aspect Ratio: 9:16 (Vertical format).",
      "Resolution: 1080p HD or above.",
      "Original audio/licensed BG music only.",
    ],
    acceptedFormats: "MP4, MOV",
    maxSizeMB: 150,
  },
  photography: {
    id: "photography",
    title: "Photography",
    subtitle: "Frames of Devotion, Streets & Lights",
    icon: "/assets/photographyicon.png",
    accent: "#991b1b",
    description: "Portraits of artisans crafting idols, radiant street lights, night skies, and raw festival emotions frozen in time.",
    guidelines: [
      "Must be an original photograph clicked by you.",
      "Frame / Aspect Ratio: Between 4:5 (Portrait) and 1.91:1 (Landscape). Recommended: 4:5 (1080×1350px) or 1:1 Square.",
      "⚠️ Do NOT submit uncropped 9:16 full-screen shots (crop to 4:5 or 1:1 to prevent Instagram cutting the edges).",
      "Basic color grading allowed; no AI generation or heavy composite cloning.",
      "Resolution: Min 1080px on short edge (2000px+ recommended for best quality).",
    ],
    acceptedFormats: "JPG, JPEG, PNG",
    maxSizeMB: 50,
  },
  content: {
    id: "content",
    title: "Content & Stories",
    subtitle: "Blogs, Experiences & Nostalgic Tales",
    icon: "/assets/contentwrittingicon.png",
    accent: "#c2410c",
    description: "Penned down childhood memories of Puja, original fiction, cultural essays, or heartfelt festival experiences.",
    guidelines: [
      "Language: English or Bengali.",
      "Word count: 500 to 1,500 words.",
      "Must be 100% original writing (Plagiarism will result in disqualification).",
      "PDF or Google Docs formatted text allowed.",
    ],
    acceptedFormats: "PDF, DOCX, TXT",
    maxSizeMB: 20,
  },
  artworks: {
    id: "artworks",
    title: "Artworks & Sketches",
    subtitle: "Digital Art, Canvas, Charcoal & Sketches",
    icon: "/assets/artworkicon.png",
    accent: "#78350f",
    description: "Traditional Alpana interpretations, modern digital vector art, acrylic paintings, or intricate Maa Durga sketches.",
    guidelines: [
      "Digital Art, Acrylic, Watercolor, Oil, Charcoal or Pencil Sketches are accepted.",
      "Upload high-res scan or well-lit flat photograph of physical artworks.",
      "Include a work-in-progress proof/layer snapshot if requested by jury.",
    ],
    acceptedFormats: "PNG, JPG, PDF",
    maxSizeMB: 50,
  },
};

export const VAHAN_MASCOTS = [
  {
    name: "Mayur (Peacock)",
    deity: "Vahan of Lord Kartikeya",
    role: "Grace, Majesty & Artistic Elegance",
    symbol: "Radiance & Creative Vibrance",
    img: "/assets/peacockicon.png",
    accent: "#0284c7",
  },
  {
    name: "Singha (The Lion)",
    deity: "Vahan of Maa Durga",
    role: "Fearless Power & Righteous Valor",
    symbol: "Divine Strength & Protection",
    img: "/assets/lionicon.png",
    accent: "#b45309",
  },
  {
    name: "Uluka (The Owl)",
    deity: "Vahan of Maa Lakshmi",
    role: "Wisdom, Foresight & Prosperity",
    symbol: "Patience & Inner Enlightenment",
    img: "/assets/owlcion.png",
    accent: "#d97706",
  },
  {
    name: "Hansa (The Swan)",
    deity: "Vahan of Maa Saraswati",
    role: "Pure Intellect & Flawless Discernment",
    symbol: "Knowledge, Music & Sacred Arts",
    img: "/assets/gooseicon.png",
    accent: "#991b1b",
  },
  {
    name: "Mushaka (The Mouse)",
    deity: "Vahan of Lord Ganesha",
    role: "Agility, Sharp Focus & Humility",
    symbol: "Overcoming Obstacles & Swiftness",
    img: "/assets/raticon.png",
    accent: "#78350f",
  },
];

export const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Create Your Masterpiece",
    desc: "Craft your artwork, film your reel, write your story, or click festive photographs.",
    icon: "/assets/eklavyaicon.png",
  },
  {
    step: "02",
    title: "Submit Online",
    desc: "Fill the dedicated category submission form with your entry details & links.",
    icon: "/assets/eventflowicon.png",
  },
  {
    step: "03",
    title: "Curation & Voting",
    desc: "Entries get featured in the virtual festival gallery for audience & jury review.",
    icon: "/assets/frameicon.png",
  },
  {
    step: "04",
    title: "Prizes & Recognition",
    desc: "Win exciting hampers, digital certificates, cash prizes, and artist spotlights.",
    icon: "/assets/giftsicon.png",
  },
];
