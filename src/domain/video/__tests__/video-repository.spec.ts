import { videoRepository } from "../../../repository/video.repository";
import { CreateVideoInputModel } from "../dto/create.input.dto";
import { RESOLUTIONS } from "../types/resolutions";

describe("videoRepository.getAll", () => {
  const testVideoData: CreateVideoInputModel = {
    title: "First Video",
    author: "One Author",
    availableResolutions: [RESOLUTIONS.P360],
  };

  beforeEach(() => {
    videoRepository.clearAll();
    videoRepository.create(testVideoData);
  });

  it("returns a copy of the collection, not the internal array", () => {
    const videos = videoRepository.getAll();

    videos.pop();

    expect(videoRepository.getAll()).toHaveLength(1);
  });

  it("returns copies of the stored videos, not references", () => {
    const [video] = videoRepository.getAll();

    video.title = "mutated from the outside";

    expect(videoRepository.getAll()[0].title).toBe(testVideoData.title);
  });
});
