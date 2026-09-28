import { Router } from "express";
import { testRouter } from "./domain/test/test.route";
import { videosRouter } from "./domain/video/video.router";
import { ROUTES } from "./shared/routes";

export const apiRouter = Router();

apiRouter.use(ROUTES.videos, videosRouter);
apiRouter.use(ROUTES.testing, testRouter);
