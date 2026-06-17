import type { LocationContent } from "../types";
import { crossListerStory } from "./cross-lister";
import { zingDevStory } from "./zing-dev";

export const londonLocation = {
  id: "london",
  label: "London",
  country: "England",
  lat: 51.5,
  lon: -0.12,
  eyebrow: "Projects / Base Camp",
  title: "London",
  description:
    "A marker for current work, experiments, and portfolio stories that need a practical city base.",
  summary:
    "London is the working base camp: the place for projects, technical growth, university memories, and the next versions of the portfolio to launch from.",
  tags: ["Product", "Engineering", "Stories"],
  stories: [zingDevStory, crossListerStory],
} satisfies LocationContent;
