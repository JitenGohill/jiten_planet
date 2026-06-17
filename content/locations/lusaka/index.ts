import type { LocationContent } from "../types";
import { lifeOutsideCodeStory } from "./life-outside-code";
import { rootsAndPerspectiveStory } from "./roots-and-perspective";

export const lusakaLocation = {
  id: "lusaka",
  label: "Lusaka",
  country: "Zambia",
  lat: -15.4,
  lon: 28.3,
  eyebrow: "Roots / Perspective",
  title: "Lusaka origin point",
  description:
    "A place for Zambia notes, personal context, travel memories, and the wider perspective behind the work.",
  summary:
    "Lusaka is the origin point: family, perspective, humor, warmth, and the background that gives the rest of the globe its sense of direction.",
  tags: ["Life", "Travel", "Perspective"],
  stories: [rootsAndPerspectiveStory, lifeOutsideCodeStory],
} satisfies LocationContent;
