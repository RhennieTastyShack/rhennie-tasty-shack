const DAILY_NOTES = [
  {
    line: "Today’s pot was finished with a little extra care, just for your table.",
    close: "Enjoy your meal.",
  },
  {
    line: "The kitchen set this plate aside with your name in mind.",
    close: "Enjoy every bite.",
  },
  {
    line: "Fresh off the fire, packed while it was still singing.",
    close: "Enjoy your meal.",
  },
  {
    line: "We tasted the pot, then sent the best spoonfuls your way.",
    close: "Enjoy it while it’s hot.",
  },
  {
    line: "A quiet thank you from the people who cooked this for you.",
    close: "Enjoy your meal.",
  },
  {
    line: "This one left the kitchen warm, seasoned, and ready for you.",
    close: "Enjoy every bite.",
  },
  {
    line: "We kept the pepper honest and the portion generous today.",
    close: "Enjoy your meal.",
  },
  {
    line: "The team plated this as if you were sitting in the dining room.",
    close: "Enjoy it while it’s hot.",
  },
  {
    line: "Your order got the first pick from the pot.",
    close: "Enjoy your meal.",
  },
  {
    line: "Cooked this morning’s way: slow, rich, and meant to be finished.",
    close: "Enjoy every bite.",
  },
  {
    line: "We wrapped this with the same pride we serve at the table.",
    close: "Enjoy your meal.",
  },
  {
    line: "A full plate, a full thank you, and the good pot of the day.",
    close: "Enjoy it while it’s hot.",
  },
  {
    line: "The aroma stayed in the kitchen; the best of it is in your pack.",
    close: "Enjoy your meal.",
  },
  {
    line: "Thank you for letting Rhennie cook for you today.",
    close: "Enjoy every bite.",
  },
];

function dayIndex(date: Date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((utc - start) / 86400000);
  return ((day % DAILY_NOTES.length) + DAILY_NOTES.length) % DAILY_NOTES.length;
}

export function thankYouNote(on: Date | string | null | undefined = new Date()) {
  const date = on ? new Date(on) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  const note = DAILY_NOTES[dayIndex(safe)];
  return `${note.line} ${note.close}`;
}

export function loginNote(on: Date | string | null | undefined = new Date()) {
  return `Thank you for coming back to Rhennie Tasty Shack. ${thankYouNote(on)}`;
}

export function orderAppreciation() {
  return "Thank you for ordering from Rhennie Tasty Shack. The kitchen appreciates you, and your plate is already on the way.";
}
