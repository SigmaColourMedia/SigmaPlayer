import { ServerResponse } from "node:http";
import type { RequestHandler } from "express";
import { EVENT_MAP, eventEmitter } from "../events.ts";

type Query = {
  id: string;
};

export const roomHandle: RequestHandler<any, any, any, Query> = async (
  req,
  res,
) => {
  res.writeHead(200, "OK", {
    "content-type": "text/event-stream",
    connection: "keep-alive",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  });

  const callback = roomHandler(req.query.id, res);

  eventEmitter.on(EVENT_MAP.ROOM_UPDATE, callback);
  req.on("close", () => {
    eventEmitter.removeListener(EVENT_MAP.ROOM_UPDATE, callback);
  });
};

function roomHandler(target_id: string, res: ServerResponse) {
  return (id: string, viewerCount: number) => {
    if (id !== target_id) return;

    const event: ServerSentEvent = {
      event: "room_update",
      payload: {
        viewer_count: viewerCount,
      },
    };
    res.write(`data: ${JSON.stringify(event)}\r\n\r\n`);
  };
}

type ServerSentEvent = {
  event: "room_update";
  payload: {
    viewer_count: number;
  };
};
