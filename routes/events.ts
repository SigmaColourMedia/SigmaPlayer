import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../zod.ts";
import { roomHandle } from "../controllers/events.ts";

export const eventsRoute = Router();

export const querySchema = z.object({
  query: z.object({
    id: z.string(),
  }),
});

eventsRoute.get("/room", validateRequest(querySchema), roomHandle);
