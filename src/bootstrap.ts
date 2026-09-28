import express, { Express } from "express";
import { apiRouter } from "./base.router";
import { ROUTES } from "./shared/routes";

export const bootstrap = (app: Express) => {
  app.use(express.json());

  app.use(ROUTES.base, apiRouter);

  app.get(ROUTES.base, (req, res) => {
    req.body;
    res.status(200).send("Hello world!");
  });
  return app;
};
