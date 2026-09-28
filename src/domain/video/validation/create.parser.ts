import { FieldError } from "../../../core/api-error/types";
import { validate } from "../../../shared/validation";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { createVideoValidationRules } from "./validation";

type Outcome =
  | { ok: true; data: CreateVideoInputModel }
  | { ok: false; errors: FieldError[] };

export function parseCreateVideoInput(body: unknown): Outcome {
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

  const data = body as CreateVideoInputModel;

  const errors = validate<CreateVideoInputModel>(
    data,
    createVideoValidationRules,
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
