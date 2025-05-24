import { EventEmitter } from "node:events";

export const eventEmitter = new EventEmitter();
export const EVENT_MAP = {
  ROOM_UPDATE: "room_update",
};
