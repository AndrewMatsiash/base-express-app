import express from "express";
import { bootstrap } from "./bootstrap";

const app = express();
bootstrap(app);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
