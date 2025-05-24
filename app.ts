import express from "express";
import logger from "morgan";
import { index } from "./routes/index.ts";
import { watchRoute } from "./routes/watch.ts";
import { eventsRoute } from "./routes/events.ts";

export const app = express();
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(index);
app.use("/watch", watchRoute);
app.use("/events", eventsRoute);
app.use("/static", express.static("public"));
app.use("/images", express.static("thumbnails"));
app.use((_, res) => {
  res.statusCode = 404;
  res.render("404");
});
