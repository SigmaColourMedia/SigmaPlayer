import type { RequestHandler } from "express";
import type { RoomData } from "../routes/index.ts";

type Params = {
  id: string;
};
export const indexHandle: RequestHandler<Params, any, any> = async (
  req,
  res,
) => {
  try {
    const roomID = req.params.id;
    const roomURL = new URL("/room", process.env.SMID_HTTP_ADDRESS);
    roomURL.searchParams.set("room_id", roomID);

    const response = await fetch(roomURL);
    if (!response.ok) {
      res.status(404);
      return res.render("room-404");
    }

    const roomData: RoomData = await response.json();
    res.render("room", { room: roomData });
  } catch {
    res.status(500);
    res.render("500");
  }
};
