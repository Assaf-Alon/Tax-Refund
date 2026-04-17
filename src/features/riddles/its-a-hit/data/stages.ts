export interface RiddleStage {
  id: string;
  locationName: string;
  hint: string;
  songIds: number[];
  nextLocationAnswer: string; // The decoded location players should type to proceed
}

export const IT_STAGE_DATA: RiddleStage[] = [
  {
    id: 'start',
    locationName: 'Herzliya Park Entrance',
    hint: 'Solve the riddle to find your first destination. Success depends on chronological order.',
    songIds: [
      101, // L - Lia - Toki wo Kizamu Uta - 2008 - Clannad After Story
      25,  // A - Ayane - Arrival of Tears - 2010 - 11eyes
      62,  // K - Kobukuro - Blue Bird - 2011 - Bakuman
      74   // E - Eir Aoi - Innocence - 2012 - Sword Art Online
    ], 
    nextLocationAnswer: 'lake',
  },
  {
    id: 'lake',
    locationName: 'The Lake',
    hint: 'You have reached the water. Now, where to next? The tracks are calling.',
    songIds: [
      1776408730771, // T - Michael Jackson - Thriller - 1982
      1776408730735, // R - Rick Astley - Never Gonna Give You Up - 1987
      1776408730777, // A - Smash Mouth - All Star - 1999
      1776416445034, // I - Bon Jovi - It's My Life - 2000
      1776416445029  // N - Linkin Park - Numb - 2003
    ],
    nextLocationAnswer: 'train',
  },
  {
    id: 'train',
    locationName: 'Small Train Station',
    hint: 'Platform 9 3/4? Not quite. Find the bench where time stands still.',
    songIds: [
      5,   // L - Spyair - Some Like It Hot - 2011 - Gintama
      14,  // O - Nano - No Pain No Game - 2012 - Btooom!
      30,  // V - Fear and Loathing in Las Vegas - Let Me Hear - 2015 - Kiseijuu
      23,  // E - Mrs. Green Apple - Inferno - 2017 - Fire Force
      18,  // R - Survive Said the Prophet - Found & Lost - 2018 - Banana Fish
      44,  // S - Ai Otsuka - Chime - 2019 - Fruits Basket
      43,  // B - Vickeblanka - Lucky Ending - 2020 - Fruits Basket
      50,  // E - WARPs UP - Pleasure - 2021 - Fruits Basket
      20,  // N - Kenshi Yonezu - Kickback - 2022 - Chainsaw Man
      253, // C - King Gnu - SPECIALZ - 2023 - Jujutsu Kaisen
      38   // H - Lilas Ikuta - Hyakka Ryouran - 2025 - The Apothecary Diaries
    ], 
    nextLocationAnswer: 'lovers bench',
  },
  {
    id: 'bench',
    locationName: 'Lovers Bench',
    hint: 'The final stretch. Climb the highest point in sight.',
    songIds: [
      1776432103947, // H - Poets of the Fall - Late Goodbye - 2004
      1776432103945, // I - Poets of the Fall - Carnival of Rust - 2009
      1776432103946, // L - Poets of the Fall - Temple of Thought (Unplugged) - 2012
      1776432103951  // L - Poets of the Fall - Cradled in Love - 2012
    ], 
    nextLocationAnswer: 'hill',
  }
];
