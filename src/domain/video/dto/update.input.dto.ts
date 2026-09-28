import { RESOLUTIONS } from "../types/resolutions";

export interface UpdateVideoInputModel {
  title: string;
  author: string;
  availableResolutions: RESOLUTIONS[];
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: string;
}
