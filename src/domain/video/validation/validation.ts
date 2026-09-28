import { Check } from "../../../shared/validation";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { UpdateVideoInputModel } from "../dto/update.input.dto";
import { RESOLUTIONS } from "../types/resolutions";

const ALLOWED_RESOLUTIONS: readonly unknown[] = Object.values(RESOLUTIONS);

const titleValidation: Check<Pick<CreateVideoInputModel, "title">> = {
  field: "title",
  isValid: (input) =>
    typeof input.title === "string" && input.title.length <= 40,
  message: "The Title shouldn\'t be more than 40 chars",
};
const authorValidation: Check<Pick<CreateVideoInputModel, "author">> = {
  field: "author",
  isValid: (input) =>
    typeof input.author === "string" && input.author.length <= 20,
  message: "The Author name shouldn\'t be more than 20 chars",
};

const availableResolutionsValidation: Check<
  Pick<CreateVideoInputModel, "availableResolutions">
> = {
  field: "availableResolutions",
  isValid: (input) =>
    Array.isArray(input.availableResolutions) &&
    input.availableResolutions.length > 0 &&
    input.availableResolutions.every((resolution) =>
      ALLOWED_RESOLUTIONS.includes(resolution),
    ),
  message: "Video should contain at least one valid resolution",
};
const minAgeRestrictionValidation: Check<
  Pick<UpdateVideoInputModel, "minAgeRestriction">
> = {
  field: "minAgeRestriction",
  isValid: (input) => {
    const age = input.minAgeRestriction;

    if (age === null) return true;

    const isAgeNumber = typeof age === "number";

    if (isAgeNumber) {
      const passAgeRestrictions = age >= 1 && age <= 18;
      return passAgeRestrictions;
    }

    return false;
  },
  message: "The value should be between 1 and 18",
};

const canBeDownloadedValidation: Check<
  Pick<UpdateVideoInputModel, "canBeDownloaded">
> = {
  field: "canBeDownloaded",
  isValid: (input) => typeof input.canBeDownloaded === "boolean",
  message: "The value should be a boolean",
};

const publicationDateValidation: Check<
  Pick<UpdateVideoInputModel, "publicationDate">
> = {
  field: "publicationDate",
  isValid: (input) =>
    typeof input.publicationDate === "string" &&
    !Number.isNaN(Date.parse(input.publicationDate)),
  message: "The value should be a date in ISO format",
};

export const createVideoValidationRules: Check<CreateVideoInputModel>[] = [
  titleValidation,
  authorValidation,
  availableResolutionsValidation,
];

export const updateVideoValidationRules: Check<UpdateVideoInputModel>[] = [
  titleValidation,
  authorValidation,
  availableResolutionsValidation,
  minAgeRestrictionValidation,
  canBeDownloadedValidation,
  publicationDateValidation,
];
