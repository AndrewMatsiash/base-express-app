import express from "express";
import request from "supertest";
import { bootstrap } from "../../../bootstrap";
import { HTTP_STATUSES } from "../../../core/http/http-statuses";
import { videoRepository } from "../../../repository/video.repository";
import { ROUTES } from "../../../shared/routes";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { RESOLUTIONS } from "../types/resolutions";

describe("POST /videos", () => {
  const app = bootstrap(express());
  const VIDEOS_URL = `${ROUTES.base}${ROUTES.videos}`;

  const validInput: CreateVideoInputModel = {
    title: "First Video",
    author: "One Author",
    availableResolutions: [RESOLUTIONS.P360, RESOLUTIONS.P720],
  };

  const post = (body: string | object) => request(app).post(VIDEOS_URL).send(body);

  beforeEach(() => {
    videoRepository.clearAll();
  });

  describe("when the input is valid", () => {
    it("responds with 201 and JSON content type", async () => {
      await post(validInput)
        .expect(HTTP_STATUSES.CREATED)
        .expect("Content-Type", /application\/json/);
    });

    it("returns the created video shaped as VideoViewModel", async () => {
      const response = await post(validInput);

      expect(Object.keys(response.body).sort()).toEqual(
        [
          "id",
          "title",
          "author",
          "canBeDownloaded",
          "minAgeRestriction",
          "createdAt",
          "publicationDate",
          "availableResolutions",
        ].sort(),
      );
    });

    it("echoes the fields sent by the client", async () => {
      const response = await post(validInput);

      expect(response.body.title).toBe(validInput.title);
      expect(response.body.author).toBe(validInput.author);
      expect(response.body.availableResolutions).toEqual(
        validInput.availableResolutions,
      );
    });

    it("fills the server-owned fields with defaults", async () => {
      const response = await post(validInput);

      expect(typeof response.body.id).toBe("number");
      expect(response.body.canBeDownloaded).toBe(false);
      expect(response.body.minAgeRestriction).toBeNull();
    });

    it("publishes the video one day after creation", async () => {
      const response = await post(validInput);

      const createdAt = new Date(response.body.createdAt).getTime();
      const publicationDate = new Date(response.body.publicationDate).getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      expect(publicationDate - createdAt).toBeGreaterThan(oneDay - 5000);
      expect(publicationDate - createdAt).toBeLessThan(oneDay + 5000);
    });

    it("stores the video so it is returned by GET", async () => {
      const created = await post(validInput);

      const response = await request(app).get(VIDEOS_URL);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(created.body);
    });

    it("gives every created video its own id", async () => {
      const first = await post(validInput);
      const second = await post(validInput);

      expect(second.body.id).not.toBe(first.body.id);
    });
  });

  describe("when the input is invalid", () => {
    const expectFieldError = async (body: string | object, field: string) => {
      const response = await post(body).expect(HTTP_STATUSES.BAD_REQUEST);

      expect(response.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field, message: expect.any(String) }),
        ]),
      );
    };

    it("rejects a missing title", async () => {
      const { title, ...body } = validInput;
      await expectFieldError(body, "title");
    });

    it("rejects a title longer than 40 chars", async () => {
      await expectFieldError({ ...validInput, title: "a".repeat(41) }, "title");
    });

    it("rejects a title of the wrong type", async () => {
      await expectFieldError({ ...validInput, title: 42 }, "title");
    });

    it("rejects a missing author", async () => {
      const { author, ...body } = validInput;
      await expectFieldError(body, "author");
    });

    it("rejects an author longer than 20 chars", async () => {
      await expectFieldError(
        { ...validInput, author: "a".repeat(21) },
        "author",
      );
    });

    it("rejects an empty availableResolutions array", async () => {
      await expectFieldError(
        { ...validInput, availableResolutions: [] },
        "availableResolutions",
      );
    });

    it("rejects availableResolutions that is not an array", async () => {
      await expectFieldError(
        { ...validInput, availableResolutions: "P720" },
        "availableResolutions",
      );
    });

    it("rejects resolutions outside the allowed enum", async () => {
      await expectFieldError(
        { ...validInput, availableResolutions: ["P999"] },
        "availableResolutions",
      );
    });

    it("reports every invalid field at once", async () => {
      const response = await post({
        title: "a".repeat(41),
        author: "a".repeat(21),
        availableResolutions: [],
      }).expect(HTTP_STATUSES.BAD_REQUEST);

      expect(response.body.errorsMessages).toHaveLength(3);
      expect(
        response.body.errorsMessages.map((error: { field: string }) => error.field).sort(),
      ).toEqual(["author", "availableResolutions", "title"].sort());
    });

    it("rejects a body that is not an object", async () => {
      const response = await post("not an object").expect(
        HTTP_STATUSES.BAD_REQUEST,
      );

      expect(Array.isArray(response.body.errorsMessages)).toBe(true);
      expect(response.body.errorsMessages.length).toBeGreaterThan(0);
    });

    it("does not store anything when the input is invalid", async () => {
      await post({ ...validInput, title: "a".repeat(41) });

      expect(videoRepository.getAll()).toHaveLength(0);
    });
  });
});
