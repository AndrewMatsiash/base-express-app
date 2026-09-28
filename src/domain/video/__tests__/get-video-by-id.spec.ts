import express from "express";
import request from "supertest";
import { bootstrap } from "../../../bootstrap";
import { HTTP_STATUSES } from "../../../core/http/http-statuses";
import { videoRepository } from "../../../repository/video.repository";
import { ROUTES } from "../../../shared/routes";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { Video } from "../types";
import { RESOLUTIONS } from "../types/resolutions";

describe("GET /videos/:id", () => {
  const app = bootstrap(express());
  const VIDEOS_URL = `${ROUTES.base}${ROUTES.videos}`;

  const testVideoData: CreateVideoInputModel = {
    title: "First Video",
    author: "One Author",
    availableResolutions: [RESOLUTIONS.P360, RESOLUTIONS.P720],
  };

  let createdVideo: Video;

  beforeEach(() => {
    videoRepository.clearAll();
    createdVideo = videoRepository.create(testVideoData);
  });

  it("responds with 200 and the requested video", async () => {
    const response = await request(app)
      .get(`${VIDEOS_URL}/${createdVideo.id}`)
      .expect(HTTP_STATUSES.OK)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual(createdVideo);
  });

  it("responds with 404 when the video does not exist", async () => {
    await request(app)
      .get(`${VIDEOS_URL}/${createdVideo.id + 1000}`)
      .expect(HTTP_STATUSES.NOT_FOUND);
  });
});
