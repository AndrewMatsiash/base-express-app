import { Video } from "../domain/video/types";
import { RESOLUTIONS } from "../domain/video/types/resolutions";

const seedVideos: Video[] = [
    {
      id: 1,
      title: "Как работает event loop в Node.js",
      author: "Dmitry Lebedev",
      canBeDownloaded: true,
      minAgeRestriction: 6,
      createdAt: "2026-09-18T09:30:00.000Z",
      publicationDate: "2026-09-19T09:30:00.000Z",
      availableResolutions: [RESOLUTIONS.P360, RESOLUTIONS.P720],
    },
    {
      id: 2,
      title: "Транзакции и уровни изоляции на пальцах",
      author: "Anna Petrova",
      canBeDownloaded: false,
      minAgeRestriction: 16,
      createdAt: "2026-09-20T14:05:00.000Z",
      publicationDate: "2026-09-21T14:05:00.000Z",
      availableResolutions: [
        RESOLUTIONS.P144,
        RESOLUTIONS.P480,
        RESOLUTIONS.P1080,
      ],
    },
    {
      id: 3,
      title: "Пишем REST API без единой библиотеки валидации",
      author: "Sergey Ivanov",
      canBeDownloaded: true,
      minAgeRestriction: 18,
      createdAt: "2026-09-21T18:45:00.000Z",
      publicationDate: "2026-09-22T18:45:00.000Z",
      availableResolutions: [RESOLUTIONS.P2160],
    },
];

export const db = {
  videos: [...seedVideos],
  lastVideoId: Math.max(0, ...seedVideos.map((video) => video.id)),
};
