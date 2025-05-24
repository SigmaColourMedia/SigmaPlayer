import { Router } from "express";
import { indexHandle } from "../controllers/watch.ts";

export const watchRoute = Router();
watchRoute.get("/:id", indexHandle);
