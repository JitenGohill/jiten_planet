import type { LocationStory } from "../types";

export const crossListerStory = {
  id: "cross-listing",
  eyebrow: "Client Project",
  title: "Cross-Lister",
  summary:
    "A sneaker resale operations platform for managing stock, listings, orders, storage, and marketplace automation from one dashboard.",
  video: {
    src: "https://player.vimeo.com/video/1202172126?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1",
    title: "Cross Listing Showcase",
  },
  paragraphs: [
    "The Cross-Listing project was one of those projects where the real challenge was not making a nice table of products, but making the messy parts of a business feel manageable. The clients had come to me complaining about quite a few pain points of their business that needed desperate automation.",
    "Their old system relied on an excel sheet to keep stock and a bunch of manual listing and relisting whenever they listed a bunch of shoes. So thats where I came in to talk to them and help identify key pain pooints and solve them.",
    "It is a sneaker inventory and cross-listing platform built for resale operations, connecting local stock to GOAT/Alias, StockX, and eBay. The app handles product intake, shelf-aware storage, marketplace listing and delisting jobs, order sync, sale detection, repricing, and audit trails.",
    "I enjoyed building this because it sits right between software engineering and real-world operations: there are background jobs that need retries, marketplace APIs that do not always behave perfectly, and a business workflow where one missed sale or stale listing can create actual problems. It also allowed me to work with new architecture styles such as Event Driven Development, this architecture was key in implementing a system that wouldn't have a single point of failure while maintaning visibility of where the exact failure happened. This was very important in a system that ahd a lot of moving parts that were communicating with eachother.",
    "The result is a practical dashboard backed by Supabase, React, TypeScript, Zod validation, and Edge Functions, with a strong focus on traceability, recovery, and keeping the seller in control.",
  ],
  tags: ["React", "Supabase", "Automation"],
} satisfies LocationStory;
