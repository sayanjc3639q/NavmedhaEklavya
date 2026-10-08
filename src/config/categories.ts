export interface CategoryTheme {
  name: string;
  desc: string;
}

export interface CategoryConfig {
  id: "reels" | "photography" | "content" | "artworks";
  categoryNumber: string;
  title: string;
  bengaliTitle: string;
  subtitle: string;
  tagline?: string;
  icon: string;
  accent: string;
  description: string;
  themes: CategoryTheme[];
  guidelines: string[];
  acceptedFormats: string;
  maxSizeMB: number;
}

export const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  reels: {
    id: "reels",
    categoryNumber: "01",
    title: "Reels and Motion",
    bengaliTitle: "Drishyer Arale",
    subtitle: "(Reels and Motion)",
    icon: "/assets/reelsmakingicon.png",
    accent: "#b45309",
    description: "Capture Maa Durga in motion, rhythm, and festive energy through creative short videos.",
    themes: [
      {
        name: "Shaktirupa",
        desc: "Women's strength and courage inspired by Maa Durga.",
      },
      {
        name: "Utsober rong",
        desc: "The vibrant visual colors, lights, and fashion of Pujo.",
      },
      {
        name: "Mondoper arale",
        desc: "Honoring artisans, dhakis, priests, and volunteers.",
      },
      {
        name: "Anuronon",
        desc: "Visualizing the rhythm of dhaks, conch shells, and chants.",
      },
      {
        name: "Bari fera",
        desc: "Family gatherings, friendships, and cherished memories.",
      },
    ],
    guidelines: [
      "Only one entry on one theme is allowed.",
      "Reel size should not exceed 150 MB. Videos will be accepted only in MP4 format.",
      "The reel duration must be maximum of 90 seconds.",
      "Plagiarism is strictly prohibited. Downloaded reels if found, will be disqualified immediately.",
    ],
    acceptedFormats: "MP4 only",
    maxSizeMB: 150,
  },
  photography: {
    id: "photography",
    categoryNumber: "02",
    title: "Photography",
    bengaliTitle: "Alok Alpona",
    subtitle: "(Photography)",
    tagline: "Light, shadow, and silent devotion",
    icon: "/assets/photographyicon.png",
    accent: "#991b1b",
    description: "An artisan crafting divinity, two sides of Pujo, as the quiet dignity of an old face framed by dhunuchi smoke, or a crowded street illuminated in warm golden light. Freeze the moments that make time stand still.",
    themes: [
      {
        name: "Mayer Karigor",
        desc: "Artisans crafting the divine idols.",
      },
      {
        name: "Pujor Shaji",
        desc: "Festive joy, style, and Pujo outfits.",
      },
      {
        name: "Alor Jhalak",
        desc: "Artistic splendor of pandals and lights.",
      },
      {
        name: "Bishorjon",
        desc: "The bittersweet emotions of farewell.",
      },
      {
        name: "Praner Spandon",
        desc: "The soul and rhythm of rituals.",
      },
    ],
    guidelines: [
      "Must be an original photograph clicked by you.",
      "Frame / Aspect Ratio: Between 4:5 (Portrait) and 1.91:1 (Landscape). Recommended: 4:5 (1080×1350px) or 1:1 Square.",
      "⚠️ Do NOT submit uncropped 9:16 full-screen shots (crop to 4:5 or 1:1 to prevent Instagram cutting the edges).",
      "Basic color grading allowed; no AI generation or heavy composite cloning.",
      "Resolution: Min 1080px on short edge (2000px+ recommended for best quality).",
    ],
    acceptedFormats: "JPEG, PNG",
    maxSizeMB: 100,
  },
  content: {
    id: "content",
    categoryNumber: "03",
    title: "Content and Stories",
    bengaliTitle: "Shabdo Shakti",
    subtitle: "(Content and Stories)",
    tagline: "The aroma of nostalgia in ink",
    icon: "/assets/contentwrittingicon.png",
    accent: "#c2410c",
    description: "The unforgettable Pujo of childhood, a bittersweet memory of coming home, or a quiet story waiting to be told. Pen down the emotions that linger long after the immersion.",
    themes: [
      {
        name: "Mondop Kotha",
        desc: "Pujo prep, para culture, and pandal hopping.",
      },
      {
        name: "Abyakto",
        desc: "Unspoken emotions conveyed through the eyes.",
      },
      {
        name: "Bidayer Rong",
        desc: "The bittersweet red of farewell.",
      },
      {
        name: "Akalbodhon",
        desc: "Awakening life through truth and character.",
      },
      {
        name: "Niranjan",
        desc: "Life's true essence through love and sacrifice.",
      },
    ],
    guidelines: [
      "Only one entry on any one theme will be allowed.",
      "Languages allowed are English, Bengali, or Hindi. Word Limit is 300 words.",
      "Submissions must be in .docx format. File Size should not exceed 10 MB.",
      "Plagiarism is strictly prohibited. Prioritize originality and creativity.",
      "Verify grammar, spelling, and punctuation before submitting.",
    ],
    acceptedFormats: ".docx format only",
    maxSizeMB: 10,
  },
  artworks: {
    id: "artworks",
    categoryNumber: "04",
    title: "Art work and Digital Art",
    bengaliTitle: "Pandaler Palette",
    subtitle: "(Art work and Digital Art)",
    tagline: "Where faith meets color",
    icon: "/assets/artworkicon.png",
    accent: "#78350f",
    description: "Traditional alpana drawn on wet courtyards, bold strokes of charcoal, or midnight digital creations. Express how Maa Durga takes shape in your mind and on your canvas.",
    themes: [
      {
        name: "Aagaman",
        desc: "The emotion and transformation of Durga's arrival.",
      },
      {
        name: "Devi",
        desc: "Women's inherent strength in every role.",
      },
      {
        name: "Mahishasura",
        desc: "Modern evils like hatred, greed, and corruption.",
      },
      {
        name: "Chokkhudan",
        desc: "Creative interpretations of Maa Durga's eyes.",
      },
    ],
    guidelines: [
      "Only one entry on one theme is allowed.",
      "File Size allowed is 100 MB maximum.",
      "Both traditional and digital art forms are allowed. Attach raw files.",
      "Submissions must be in JPEG or PNG format.",
      "Plagiarism is strictly prohibited. Participant will be disqualified immediately if found so.",
    ],
    acceptedFormats: "JPEG, PNG",
    maxSizeMB: 100,
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
    desc: "Win exciting hampers, digital certificates, trophies, and artist spotlights.",
    icon: "/assets/giftsicon.png",
  },
];
