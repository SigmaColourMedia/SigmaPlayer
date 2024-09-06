import { RoomData } from "./api";
import { html } from "lit";
import { RoomTile } from "./roomTile";
import { LockIcon } from "../icons/lockIcon";
import { MockRoom } from "./mockRoom";

export function RoomCarousel(roomData: RoomData) {
  const mockRoomsToRender = roomData.length < 3 ? 3 - roomData.length : 0;
  const mockRooms = Array.from({ length: mockRoomsToRender });
  return html` <div class="rooms-carousel">
    ${roomData.map(RoomTile)} ${mockRooms.map(() => MockRoom)}
  </div>`;
}
