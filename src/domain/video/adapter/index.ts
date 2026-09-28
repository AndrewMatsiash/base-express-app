import { CreateVideoInputModel } from "../dto/create.input.dto";

export function createDraftVideoRecord(input: CreateVideoInputModel) {
  const today = new Date();
  const nextDay = new Date(new Date().setDate(new Date().getDate() + 1));

  return {
    title: input.title ?? "",
    author: input.author ?? "",
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: today.toISOString(),
    publicationDate: nextDay.toISOString(),
    availableResolutions: input.availableResolutions,
  };
}
