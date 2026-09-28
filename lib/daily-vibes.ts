const DAILY_VIBES: Record<string, string[]> = {
  Sunday: [
    "Sunday plate, slow and special. 🍲",
    "Rest easy. The kitchen has the pot. ✨",
    "A soft Sunday, served hot. 💛",
  ],
  Monday: [
    "New week, new goals! 🚀",
    "Monday mood: Coffee and productivity. ☕",
    "Crushing this Monday! 💪",
  ],
  Tuesday: [
    "Tuesday taste is already winning. 🔥",
    "Keep the week moving. Your plate is ready. 🍽️",
    "Small Tuesday joy, big flavour. ✨",
  ],
  Wednesday: [
    "Happy Hump Day! 🐪",
    "Halfway to the weekend! 🎉",
    "Mid-week magic is happening. ✨",
  ],
  Thursday: [
    "Thursday energy: almost there. 🌟",
    "One more push, then the weekend pot. 🍲",
    "Treat Thursday like a head start. 💪",
  ],
  Friday: [
    "Weekend loading... 🔋",
    "Friday feels! 🥳",
    "Finish strong, the weekend is here! 💃",
  ],
  Saturday: [
    "Saturday is for second helpings. 🎉",
    "The weekend plate just landed. 🍽️",
    "Stay out late. We will keep it hot. 🔥",
  ],
};

export function currentWeekday(on: Date = new Date()) {
  return on.toLocaleDateString("en-US", { weekday: "long" });
}

export function pickDailyVibe(
  on: Date = new Date(),
  random: () => number = Math.random
) {
  const options = DAILY_VIBES[currentWeekday(on)] || DAILY_VIBES.Monday;
  const index = Math.floor(random() * options.length);
  return options[Math.min(index, options.length - 1)];
}
