import express from "express";
import request from "supertest";
import { bootstrap } from "../../../bootstrap";
import { HTTP_STATUSES } from "../../../core/http/http-statuses";
import { videoRepository } from "../../../repository/video.repository";
import { ROUTES } from "../../../shared/routes";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { Video } from "../types";
import { RESOLUTIONS } from "../types/resolutions";

describe("DELETE /videos/:id", () => {
  const app = bootstrap(express());
  const VIDEOS_URL = `${ROUTES.base}${ROUTES.videos}`;

  const firstInput: CreateVideoInputModel = {
    title: "First Video",
    author: "One Author",
    availableResolutions: [RESOLUTIONS.P360],
  };

  const secondInput: CreateVideoInputModel = {
    title: "Second Video",
    author: "Another Author",
    availableResolutions: [RESOLUTIONS.P1080],
  };

  let first: Video;
  let second: Video;

  const remove = (id: number | string) =>
    request(app).delete(`${VIDEOS_URL}/${id}`);

  beforeEach(() => {
    videoRepository.clearAll();
    first = videoRepository.create(firstInput);
    second = videoRepository.create(secondInput);
  });

  describe("when the video exists", () => {
    it("responds with 204 and no body", async () => {
      const response = await remove(first.id).expect(
        HTTP_STATUSES.NO_CONTENT,
      );

      expect(response.text).toBe("");
    });

    it("removes the video from the collection", async () => {
      await remove(first.id);

      await request(app)
        .get(`${VIDEOS_URL}/${first.id}`)
        .expect(HTTP_STATUSES.NOT_FOUND);
    });

    it("keeps the other videos untouched", async () => {
      await remove(first.id);

      const response = await request(app).get(VIDEOS_URL);

      expect(response.body).toEqual([second]);
    });

    it("responds with 404 on a repeated delete", async () => {
      await remove(first.id).expect(HTTP_STATUSES.NO_CONTENT);
      await remove(first.id).expect(HTTP_STATUSES.NOT_FOUND);
    });

    it("does not reuse the id of a deleted video", async () => {
      await remove(second.id);

      const created = videoRepository.create(firstInput);

      expect(created.id).toBeGreaterThan(second.id);
    });
  });

  describe("when the video does not exist", () => {
    it("responds with 404 for an unknown id", async () => {
      await remove(first.id + 1000).expect(HTTP_STATUSES.NOT_FOUND);
    });

    it("responds with 404 for a non-numeric id", async () => {
      await remove("abc").expect(HTTP_STATUSES.NOT_FOUND);
    });

    it("does not change the collection", async () => {
      await remove(first.id + 1000);

      expect(videoRepository.getAll()).toHaveLength(2);
    });
  });

  describe("DELETE /testing/all-data", () => {
    it("responds with 204 and wipes every video", async () => {
      await request(app)
        .delete(`${ROUTES.base}${ROUTES.testing}/all-data`)
        .expect(HTTP_STATUSES.NO_CONTENT);

      const response = await request(app).get(VIDEOS_URL);

      expect(response.body).toEqual([]);
    });
  });
});
