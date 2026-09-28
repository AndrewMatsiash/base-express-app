import { Router, type Request, type Response } from "express";
import { HTTP_STATUSES } from "../../core/http/http-statuses";
import { videoRepository } from "../../repository/video.repository";

export const testRouter = Router({});

testRouter.delete(`/all-data`, (_: Request, res: Response) => {
  videoRepository.clearAll();
  return res.sendStatus(HTTP_STATUSES.NO_CONTENT);
});
