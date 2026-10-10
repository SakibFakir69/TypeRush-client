/** Static dashboard content (mockup-faithful placeholders until backend stats land). */

export const DASH = {
  level: 12,
  xp: 820,
  xpMax: 1000,
  stats: {
    wpm: 124,
    wpmDelta: 12,
    best: 168,
    accuracy: 98,
    accDelta: 2,
    streakDays: 6,
    points: 12480,
    rank: 12,
    races: 523,
    contests: 12,
    badges: 8,
  },
  board: [
    { rank: 1, name: "Alex Carter", wpm: 182, img: 12 },
    { rank: 2, name: "Maria Garcia", wpm: 176, img: 32 },
    { rank: 3, name: "James Lee", wpm: 168, img: 53 },
    { rank: 12, name: "Sakib", wpm: 124, img: 11, you: true },
    { rank: 24, name: "Tanvir Hasan", wpm: 102, img: 59 },
  ],
  activity: [
    { icon: "zap", text: "You achieved Speed Demon", when: "2 hours ago" },
    { icon: "chart", text: "You set a new personal best: 3 hours ago · 168 WPM", when: "3 hours ago" },
    { icon: "swords", text: "Maria Garcia challenged you", when: "5 hours ago" },
    { icon: "trophy", text: "You joined the Weekly Typing Showdown", when: "6 hours ago" },
    { icon: "xp", text: "You earned 50 XP", when: "7 hours ago" },
  ],
  achievements: [
    { icon: "zap", name: "Speed Demon", xp: "+50 XP" },
    { icon: "target", name: "Accuracy Master", xp: "+40 XP" },
    { icon: "flame", name: "Consistent Typist", xp: "+30 XP" },
    { icon: "swords", name: "Battle Ready", xp: "+50 XP" },
  ],
  friends: [12, 32, 53, 11, 59],
  contests: [
    { name: "Weekend Sprint", dates: "Oct 11 – Oct 12" },
    { name: "Fall Championship", dates: "Oct 18 – Oct 24" },
    { name: "Global Typing Cup", dates: "Oct 25 – Nov 2" },
  ],
  recentChips: [
    { icon: "check", title: "Completed Daily Goal", desc: "Oct 10, 2025 · 3/3 sessions" },
    { icon: "trophy", title: "Won 1v1 Battle", desc: "vs Alex Carter · +30 XP" },
    { icon: "users", title: "Joined Contest", desc: "Weekly Typing Showdown" },
    { icon: "award", title: "New Achievement", desc: "Accuracy Master · +40 XP" },
  ],
};

export const CHART: Record<string, { labels: string[]; wpm: number[]; acc: number[] }> = {
  "7D": {
    labels: ["Oct 4", "Oct 5", "Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10"],
    wpm: [62, 84, 108, 98, 128, 118, 142],
    acc: [38, 48, 72, 58, 88, 78, 102],
  },
  "30D": {
    labels: ["Sep 11", "Sep 16", "Sep 21", "Sep 26", "Oct 1", "Oct 6", "Oct 10"],
    wpm: [48, 66, 74, 92, 96, 118, 142],
    acc: [30, 44, 52, 64, 70, 86, 102],
  },
  "90D": {
    labels: ["Jul 12", "Jul 27", "Aug 11", "Aug 26", "Sep 10", "Sep 25", "Oct 10"],
    wpm: [34, 52, 68, 84, 104, 122, 142],
    acc: [24, 36, 50, 62, 78, 92, 102],
  },
};
