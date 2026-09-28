import { RESOLUTIONS } from "../types/resolutions";

export interface CreateVideoInputModel {
  title: string;
  author: string;
  availableResolutions: RESOLUTIONS[];
}
