import { Router, type Request, type Response } from "express";
import { APIErrorResult } from "../../core/api-error/types";
import { HTTP_STATUSES } from "../../core/http/http-statuses";
import { videoRepository } from "../../repository/video.repository";
import { parseId } from "../../shared/parse-id";
import { CreateVideoInputModel } from "./dto/create.input.dto";
import { parseCreateVideoInput } from "./validation/create.parser";
import { parseUpdateVideoInput } from "./validation/update.parser";

export const videosRouter = Router({});

videosRouter
  .get("/", (_: Request, res: Response) => {
    const videos = videoRepository.getAll();
    res.status(HTTP_STATUSES.OK).send(videos);
  })
  .get("/:id", (req: Request<{ id: string }>, res: Response) => {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    const video = videoRepository.getOne(id);

    if (!video) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    return res.status(HTTP_STATUSES.OK).send(video);
  })
  .post("/", (req: Request<any, any, CreateVideoInputModel>, res: Response) => {
    const parsed = parseCreateVideoInput(req.body);

    if (!parsed.ok) {
      const badResponse: APIErrorResult = {
        errorsMessages: parsed.errors,
      };
      return res.status(HTTP_STATUSES.BAD_REQUEST).send(badResponse);
    }

    const newVideo = videoRepository.create(parsed.data);
    return res.status(HTTP_STATUSES.CREATED).send(newVideo);
  })
  .put("/:id", (req: Request<{ id: string }>, res: Response) => {
    const parsed = parseUpdateVideoInput(req.body);

    if (!parsed.ok) {
      const badResponse: APIErrorResult = {
        errorsMessages: parsed.errors,
      };

      return res.status(HTTP_STATUSES.BAD_REQUEST).send(badResponse);
    }

    const id = parseId(req.params.id);

    if (id === null) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    const updatedVideo = videoRepository.update(id, parsed.data);

    if (!updatedVideo) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  })
  .delete("/:id", (req: Request<{ id: string }>, res: Response) => {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    const deletedVideo = videoRepository.delete(id);

    if (!deletedVideo) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  });
