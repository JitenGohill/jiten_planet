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
    summary:
      "London is the working base camp: the place for projects, technical growth, university memories, and the next versions of the portfolio to launch from.",
    stories: [
      {
        id: "queen-mary",
        eyebrow: "Education",
        title: "Queen Mary chapter",
        summary:
          "A placeholder space for the university years, computer science foundations, and the people who shaped how I think.",
        body:
          "This story will expand into the full Queen Mary chapter: what I studied, the projects that stretched me, the habits I built, and the moments that made London feel like more than a study destination. For now, this placeholder marks the academic foundation behind the portfolio.",
        tags: ["Computer Science", "Growth"],
      },
      {
        id: "building-mode",
        eyebrow: "Projects",
        title: "Building mode",
        summary:
          "A compact preview for current projects, experiments, and the kind of engineering work I want to showcase.",
        body:
          "This larger card will eventually tell the story behind the work: the products I have built, the problems I enjoy solving, and the practical engineering decisions that matter to me. It can link together portfolio projects, technical notes, and lessons learned from shipping things.",
        tags: ["Product", "Engineering"],
      },
      {
        id: "cross-listing",
        eyebrow: "Client Project",
        title: "Cross-Lister",
        summary:
          "A sneaker resale operations platform for managing stock, listings, orders, storage, and marketplace automation from one dashboard.",
        body:
          "Cross-Lister is one of those projects where the real challenge was not making a nice table of products, but making the messy parts of a business feel manageable. It is a sneaker inventory and cross-listing platform built for resale operations, connecting local stock to GOAT/Alias, StockX, and eBay. The app handles product intake, shelf-aware storage, marketplace listing and delisting jobs, order sync, sale detection, repricing, and audit trails. I enjoyed building this because it sits right between software engineering and real-world operations: there are background jobs that need retries, marketplace APIs that do not always behave perfectly, and a business workflow where one missed sale or stale listing can create actual problems. The result is a practical dashboard backed by Supabase, React, TypeScript, Zod validation, and Edge Functions, with a strong focus on traceability, recovery, and keeping the seller in control.",
        tags: ["React", "Supabase", "Automation"],
      },
    ],
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
    summary:
      "Lusaka is the origin point: family, perspective, humor, warmth, and the background that gives the rest of the globe its sense of direction.",
    stories: [
      {
        id: "roots-and-perspective",
        eyebrow: "Roots",
        title: "Roots and perspective",
        summary:
          "A short preview about where I come from and how Zambia influences the way I see people, work, and opportunity.",
        body:
          "This full story will become a more personal note about Lusaka: the early memories, the family context, the cultural perspective, and the parts of Zambia that keep me grounded while I build elsewhere. It should help visitors understand the person behind the projects.",
        tags: ["Family", "Perspective"],
      },
      {
        id: "life-outside-code",
        eyebrow: "Life",
        title: "Life outside code",
        summary:
          "A placeholder for personality, travel memories, interests, and the things that make the portfolio feel human.",
        body:
          "This expanded story can hold the lighter side of the site: travel memories, favorite routines, unexpected adventures, and the personality details that do not fit inside a CV. For now, it gives Lusaka a second doorway beyond professional context.",
        tags: ["Travel", "Personality"],
      },
    ],
    tags: ["Life", "Travel", "Perspective"],
  },
] as const;

export type LocationMarker = (typeof locationMarkers)[number];
export type LocationMarkerId = LocationMarker["id"];
export type LocationStory = LocationMarker["stories"][number];
export type LocationStoryId = LocationStory["id"];
