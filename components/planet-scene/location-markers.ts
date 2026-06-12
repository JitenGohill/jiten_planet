export const locationMarkers = [
  {
    id: "london",
    label: "London",
    country: "England",
    lat: 51.5,
    lon: -0.12,
    eyebrow: "Projects / Base Camp",
    title: "London launchpad",
    description:
      "A marker for current work, experiments, and portfolio stories that need a practical city base.",
    tags: ["Product", "Engineering", "Stories"],
  },
  {
    id: "lusaka",
    label: "Lusaka",
    country: "Zambia",
    lat: -15.4,
    lon: 28.3,
    eyebrow: "Roots / Perspective",
    title: "Lusaka origin point",
    description:
      "A place for Zambia notes, personal context, travel memories, and the wider perspective behind the work.",
    tags: ["Life", "Travel", "Perspective"],
  },
] as const;

export type LocationMarker = (typeof locationMarkers)[number];
export type LocationMarkerId = LocationMarker["id"];
