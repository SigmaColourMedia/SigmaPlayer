import express from "express";
// @ts-ignore
import { readBuildManifest } from "./build";
import path from "node:path";

const APP_PORT = 9000;

const buildManifest = readBuildManifest();

const app = express();

app.set("view engine", "pug");
app.use(express.static("../assets"));
app.use(express.static("../static"));

app.get("/", (req, res, next) => {
  res.render("index", {
    helloText: "hello!",
    bundlePath: buildManifest["home.js"],
  });
});

app.listen(APP_PORT, () => console.log(`App listening on port: ${APP_PORT}`));
