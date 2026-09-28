import express from "express";
import request from "supertest";
import { bootstrap } from "../../../bootstrap";
import { HTTP_STATUSES } from "../../../core/http/http-statuses";
import { videoRepository } from "../../../repository/video.repository";
import { ROUTES } from "../../../shared/routes";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { Video } from "../types";
import { RESOLUTIONS } from "../types/resolutions";

describe("GET /videos", () => {
  const app = bootstrap(express());
  const VIDEOS_URL = `${ROUTES.base}${ROUTES.videos}`;

  const testVideosData: CreateVideoInputModel[] = [
    {
      title: "First Video",
      author: "One Author",
      availableResolutions: [RESOLUTIONS.P360, RESOLUTIONS.P720],
    },
    {
      title: "Second Video",
      author: "Another Author",
      availableResolutions: [RESOLUTIONS.P1080],
    },
  ];

  let createdVideos: Video[] = [];

  beforeEach(() => {
    videoRepository.clearAll();
    createdVideos = testVideosData.map((input) => videoRepository.create(input));
  });

  it("responds with 200 and JSON content type", async () => {
    await request(app)
      .get(VIDEOS_URL)
      .expect(HTTP_STATUSES.OK)
      .expect("Content-Type", /application\/json/);
  });

  it("returns every video stored in the db", async () => {
    const response = await request(app).get(VIDEOS_URL);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(createdVideos.length);
    expect(response.body).toEqual(createdVideos);
  });

  it("returns videos shaped as VideoViewModel", async () => {
    const response = await request(app).get(VIDEOS_URL);
    const [video] = response.body;

    expect(Object.keys(video).sort()).toEqual(
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

  it("returns dates as ISO strings", async () => {
    const response = await request(app).get(VIDEOS_URL);
    const [video] = response.body;

    expect(typeof video.createdAt).toBe("string");
    expect(video.createdAt).toBe(new Date(video.createdAt).toISOString());
    expect(video.publicationDate).toBe(
      new Date(video.publicationDate).toISOString(),
    );
  });

  it("returns availableResolutions as an array of allowed values", async () => {
    const response = await request(app).get(VIDEOS_URL);
    const allowed = Object.values(RESOLUTIONS);

    for (const video of response.body) {
      expect(Array.isArray(video.availableResolutions)).toBe(true);

      for (const resolution of video.availableResolutions) {
        expect(allowed).toContain(resolution);
      }
    }
  });

  it("does not modify stored videos (GET is safe)", async () => {
    const before = videoRepository.getAll();

    await request(app).get(VIDEOS_URL);
    await request(app).get(VIDEOS_URL);

    expect(videoRepository.getAll()).toEqual(before);
  });

  it("returns an empty array when there are no videos", async () => {
    videoRepository.clearAll();

    const response = await request(app)
      .get(VIDEOS_URL)
      .expect(HTTP_STATUSES.OK);

    expect(response.body).toEqual([]);
  });
});
