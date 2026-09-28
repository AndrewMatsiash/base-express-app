import { db } from "../db/video.db";
import { createDraftVideoRecord } from "../domain/video/adapter";
import { CreateVideoInputModel } from "../domain/video/dto/create.input.dto";
import { UpdateVideoInputModel } from "../domain/video/dto/update.input.dto";
import { Video } from "../domain/video/types";

export const videoRepository = {
  getAll: (): Video[] => db.videos.map((video) => ({ ...video })),

  getOne: (id: number): Video | undefined => {
    const foundVideo = db.videos.find((video) => video.id === id);

    return foundVideo && { ...foundVideo };
  },

  create: (input: CreateVideoInputModel): Video => {
    const newVideo: Video = {
      id: ++db.lastVideoId,
      ...createDraftVideoRecord(input),
    };

    db.videos.push(newVideo);

    return { ...newVideo };
  },

  update: (id: number, input: UpdateVideoInputModel): Video | undefined => {
    const index = db.videos.findIndex((video) => video.id === id);

    if (index === -1) return undefined;

    const updatedVideo: Video = { ...db.videos[index], ...input };

    db.videos[index] = updatedVideo;

    return { ...updatedVideo };
  },

  clearAll: () => {
    db.videos = [];
    db.lastVideoId = 0;
  },
  delete: (id: number): Video | undefined => {
    const index = db.videos.findIndex((video) => video.id === id);

    if (index === -1) return undefined;

    const deleted = db.videos.splice(index, 1)[0];
    return { ...deleted };
  },
};
