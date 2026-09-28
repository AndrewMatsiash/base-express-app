import express from "express";
import request from "supertest";
import { bootstrap } from "../../../bootstrap";
import { HTTP_STATUSES } from "../../../core/http/http-statuses";
import { videoRepository } from "../../../repository/video.repository";
import { ROUTES } from "../../../shared/routes";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { UpdateVideoInputModel } from "../dto/update.input.dto";
import { Video } from "../types";
import { RESOLUTIONS } from "../types/resolutions";

describe("PUT /videos/:id", () => {
  const app = bootstrap(express());
  const VIDEOS_URL = `${ROUTES.base}${ROUTES.videos}`;

  const createInput: CreateVideoInputModel = {
    title: "Original Title",
    author: "Original Author",
    availableResolutions: [RESOLUTIONS.P360],
  };

  const validUpdate: UpdateVideoInputModel = {
    title: "Updated Title",
    author: "Updated Author",
    availableResolutions: [RESOLUTIONS.P720, RESOLUTIONS.P1080],
    canBeDownloaded: true,
    minAgeRestriction: 16,
    publicationDate: "2026-10-01T12:00:00.000Z",
  };

  let existing: Video;

  const put = (id: number | string, body: string | object) =>
    request(app).put(`${VIDEOS_URL}/${id}`).send(body);

  const getOne = (id: number) => request(app).get(`${VIDEOS_URL}/${id}`);

  beforeEach(() => {
    videoRepository.clearAll();
    existing = videoRepository.create(createInput);
  });

  describe("when the input is valid", () => {
    it("responds with 204 and no body", async () => {
      const response = await put(existing.id, validUpdate).expect(
        HTTP_STATUSES.NO_CONTENT,
      );

      expect(response.text).toBe("");
    });

    it("applies every updatable field", async () => {
      await put(existing.id, validUpdate);

      const { body } = await getOne(existing.id);

      expect(body.title).toBe(validUpdate.title);
      expect(body.author).toBe(validUpdate.author);
      expect(body.availableResolutions).toEqual(
        validUpdate.availableResolutions,
      );
      expect(body.canBeDownloaded).toBe(validUpdate.canBeDownloaded);
      expect(body.minAgeRestriction).toBe(validUpdate.minAgeRestriction);
      expect(body.publicationDate).toBe(validUpdate.publicationDate);
    });

    it("keeps the server-owned fields untouched", async () => {
      await put(existing.id, validUpdate);

      const { body } = await getOne(existing.id);

      expect(body.id).toBe(existing.id);
      expect(body.createdAt).toBe(existing.createdAt);
    });

    it("accepts null as minAgeRestriction", async () => {
      await put(existing.id, {
        ...validUpdate,
        minAgeRestriction: null,
      }).expect(HTTP_STATUSES.NO_CONTENT);

      const { body } = await getOne(existing.id);

      expect(body.minAgeRestriction).toBeNull();
    });

    it("accepts the boundary values of minAgeRestriction", async () => {
      await put(existing.id, { ...validUpdate, minAgeRestriction: 1 }).expect(
        HTTP_STATUSES.NO_CONTENT,
      );
      await put(existing.id, { ...validUpdate, minAgeRestriction: 18 }).expect(
        HTTP_STATUSES.NO_CONTENT,
      );
    });

    it("does not create a new video", async () => {
      await put(existing.id, validUpdate);

      expect(videoRepository.getAll()).toHaveLength(1);
    });

    it("is idempotent", async () => {
      await put(existing.id, validUpdate);
      const first = await getOne(existing.id);

      await put(existing.id, validUpdate);
      const second = await getOne(existing.id);

      expect(second.body).toEqual(first.body);
    });
  });

  describe("when the video does not exist", () => {
    it("responds with 404 for an unknown id", async () => {
      await put(existing.id + 1000, validUpdate).expect(
        HTTP_STATUSES.NOT_FOUND,
      );
    });

    it("responds with 404 for a non-numeric id", async () => {
      await put("abc", validUpdate).expect(HTTP_STATUSES.NOT_FOUND);
    });
  });

  describe("when the input is invalid", () => {
    const expectFieldError = async (body: string | object, field: string) => {
      const response = await put(existing.id, body).expect(
        HTTP_STATUSES.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field, message: expect.any(String) }),
        ]),
      );
    };

    it("rejects a missing title", async () => {
      const { title, ...body } = validUpdate;
      await expectFieldError(body, "title");
    });

    it("rejects a title longer than 40 chars", async () => {
      await expectFieldError({ ...validUpdate, title: "a".repeat(41) }, "title");
    });

    it("rejects an author longer than 20 chars", async () => {
      await expectFieldError(
        { ...validUpdate, author: "a".repeat(21) },
        "author",
      );
    });

    it("rejects an empty availableResolutions array", async () => {
      await expectFieldError(
        { ...validUpdate, availableResolutions: [] },
        "availableResolutions",
      );
    });

    it("rejects resolutions outside the allowed enum", async () => {
      await expectFieldError(
        { ...validUpdate, availableResolutions: ["P999"] },
        "availableResolutions",
      );
    });

    it("rejects minAgeRestriction below 1", async () => {
      await expectFieldError(
        { ...validUpdate, minAgeRestriction: 0 },
        "minAgeRestriction",
      );
    });

    it("rejects minAgeRestriction above 18", async () => {
      await expectFieldError(
        { ...validUpdate, minAgeRestriction: 19 },
        "minAgeRestriction",
      );
    });

    it("rejects minAgeRestriction of the wrong type", async () => {
      await expectFieldError(
        { ...validUpdate, minAgeRestriction: "16" },
        "minAgeRestriction",
      );
    });

    it("rejects canBeDownloaded of the wrong type", async () => {
      await expectFieldError(
        { ...validUpdate, canBeDownloaded: "true" },
        "canBeDownloaded",
      );
    });

    it("rejects publicationDate of the wrong type", async () => {
      await expectFieldError(
        { ...validUpdate, publicationDate: 20261001 },
        "publicationDate",
      );
    });

    it("rejects a missing canBeDownloaded", async () => {
      const { canBeDownloaded, ...body } = validUpdate;
      await expectFieldError(body, "canBeDownloaded");
    });

    it("rejects a missing publicationDate", async () => {
      const { publicationDate, ...body } = validUpdate;
      await expectFieldError(body, "publicationDate");
    });

    it("rejects a publicationDate that is not a date", async () => {
      await expectFieldError(
        { ...validUpdate, publicationDate: "yesterday" },
        "publicationDate",
      );
    });

    it("reports every invalid field at once", async () => {
      const response = await put(existing.id, {
        title: "a".repeat(41),
        author: "a".repeat(21),
        availableResolutions: [],
      }).expect(HTTP_STATUSES.BAD_REQUEST);

      expect(response.body.errorsMessages.length).toBeGreaterThanOrEqual(3);
    });

    it("rejects a body that is not an object", async () => {
      const response = await put(existing.id, "not an object").expect(
        HTTP_STATUSES.BAD_REQUEST,
      );

      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
    });

    it("leaves the stored video untouched", async () => {
      await put(existing.id, { ...validUpdate, title: "a".repeat(41) });

      const { body } = await getOne(existing.id);

      expect(body).toEqual(existing);
    });

    it("answers 400 before 404 when both the body and the id are wrong", async () => {
      await put(existing.id + 1000, { ...validUpdate, title: 42 }).expect(
        HTTP_STATUSES.BAD_REQUEST,
      );
    });
  });
});
