import { staticFile, random } from "remotion";

const BACKGROUND_SOUNDS = [
  "backsounds/backsound-1.mp3",
  "backsounds/backsound-2.mp3",
];

export function getRandomBackgroundSound(seed?: string): string {
  const randomIndex = Math.floor(random(seed || "background-sound") * BACKGROUND_SOUNDS.length);
  return staticFile(BACKGROUND_SOUNDS[randomIndex]);
}

export function getAllBackgroundSounds(): string[] {
  return BACKGROUND_SOUNDS.map(sound => staticFile(sound));
}