import { Router } from "express";
import { indexHandle } from "../controllers/index.ts";

export const index = Router();

export type RoomData = {
  room_id: string;
  viewer_count: number;
};

index.get("/", indexHandle);
