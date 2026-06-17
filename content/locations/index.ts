import { londonLocation } from "./london";
import { lusakaLocation } from "./lusaka";

export const locationMarkers = [londonLocation, lusakaLocation];

export type { LocationContent, LocationStory, LocationVideo } from "./types";
export type LocationMarker = (typeof locationMarkers)[number];
export type LocationMarkerId = LocationMarker["id"];
export type LocationStoryId = LocationMarker["stories"][number]["id"];
