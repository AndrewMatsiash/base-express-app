import { FieldError } from "../../../core/api-error/types";
import { validate } from "../../../shared/validation";
import { UpdateVideoInputModel } from "../dto/update.input.dto";
import { updateVideoValidationRules } from "./validation";

type Outcome =
  | { ok: true; data: UpdateVideoInputModel }
  | { ok: false; errors: FieldError[] };

export function parseUpdateVideoInput(body: unknown): Outcome {
  const isObject = typeof body === "object" && body !== null;

  if (!isObject) {
    return {
      ok: false,
      errors: [
        {
          field: "",
          message: "Body should be an object",
        },
      ],
    };
  }

  const data = body as UpdateVideoInputModel;

  const errors = validate<UpdateVideoInputModel>(
    data,
    updateVideoValidationRules,
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
