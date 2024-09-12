import express from "express";
// @ts-ignore
import { readBuildManifest } from "./build";
import path from "node:path";
import compression from "compression";
import { SUNDER_URL } from "./config";

const APP_PORT = 9000;

const buildManifest = readBuildManifest();
const app = express();

app.use(compression());
app.set("view engine", "pug");
app.use(express.static("../assets"));
app.use(express.static("../static"));

app.get("/", (req, res, next) => {
  res.render("home", {
    bundlePath: buildManifest["home.js"],
  });
});

app.get("/watch/:id", (req, res) => {
  const id = req.params.id;
  const bundlePath = path.join("/", buildManifest["watch.js"]);

  const thumbnailURL = new URL("/images?image=id", SUNDER_URL);
  res.render("watch", {
    id,
    bundlePath,
    thumbnailURL,
  });
});
app.listen(APP_PORT, () => console.log(`App listening on port: ${APP_PORT}`));
