export interface LocationVideo {
  src: string;
  title: string;
}

export interface LocationStory {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  paragraphs: string[];
  tags: string[];
  video?: LocationVideo;
}

export interface LocationContent {
  id: string;
  label: string;
  country: string;
  lat: number;
  lon: number;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  tags: string[];
  stories: LocationStory[];
}
