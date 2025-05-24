import type { RequestHandler } from "express";
import type { RoomData } from "../routes/index.ts";

export const indexHandle: RequestHandler = async (
  req,
  res,
) => {
  try {
    const roomURL = new URL("/rooms", process.env.SMID_HTTP_ADDRESS);
    const rooms: RoomData[] = await fetch(roomURL).then((res) => res.json());
    res.render("index", { rooms });
  } catch {
    res.render("500");
  }
};
