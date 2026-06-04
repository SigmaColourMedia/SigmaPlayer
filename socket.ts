import { createSocket } from "dgram";
import { handleThumbnailEvent } from "./thumbnail.ts";
import { parseRPCEvent } from "./rpc.ts";
import { EVENT_MAP, eventEmitter } from "./events.ts";

export const socket = createSocket("udp4");

socket.on("message", async (data) => {
  const rpcEvent = parseRPCEvent(data);
  if (!rpcEvent) return;

  switch (rpcEvent.method) {
    case "new_thumbnail": {
      await handleThumbnailEvent(rpcEvent.params.uuid);
      break;
    }
    case "new_room": {
      await handleThumbnailEvent(rpcEvent.params.uuid);
      break;
    }
    case "room_change": {
      eventEmitter.emit(
        EVENT_MAP.ROOM_UPDATE,
        rpcEvent.params.uuid,
        rpcEvent.params.viewer_count,
      );
    }
  }
});
