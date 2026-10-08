export type NavItem = {
  label: string;
  href: string;
  sectionId: string;
};

// Prod nav: 1v1 Battle + Pricing removed per request.
// Hrefs are root-absolute so they also work from /test;
// sectionId drives the scrollspy glow on the landing page.
export const NAV_ITEMS: NavItem[] = [
  { label: "Practice", href: "/#practice", sectionId: "practice" },
  { label: "Challenges", href: "/#challenges", sectionId: "challenges" },
  { label: "Leaderboard", href: "/#leaderboard", sectionId: "leaderboard" },
  { label: "Contests", href: "/#contests", sectionId: "contests" },
  { label: "About", href: "/#about", sectionId: "about" },
];

export const TYPING_TARGET =
  "The quick brown fox jumps over the lazy dog. A fast movement of the enemy will jeopardize six gunboats. Pack my box with five dozen liquor jugs.";

export const TOP_TYPISTS = [
  { name: "SpeedMaster", wpm: "167 WPM", rank: "🥇" },
  { name: "TypeNinja", wpm: "156 WPM", rank: "🥈" },
  { name: "KeyBlazer", wpm: "148 WPM", rank: "🥉" },
  { name: "Sakib", wpm: "123 WPM", rank: "4" },
  { name: "SwiftTyper", wpm: "118 WPM", rank: "5" },
] as const;

export const VALUE_PROPS = [
  { title: "Improve Speed", desc: "Train faster typing through focused practice." },
  { title: "Better Accuracy", desc: "Reduce mistakes and type with confidence." },
  { title: "Compete & Win", desc: "Challenge others in battles and contests." },
  { title: "Track Progress", desc: "Detailed stats to beat your personal best." },
] as const;
