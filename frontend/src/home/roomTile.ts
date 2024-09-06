import { Room } from "./api";
import { html } from "lit";
import { PlayIcon } from "../icons/playIcon";
import { ViewerIcon } from "../icons/viewerIcon";
import { FILE_STORAGE_URL } from "../config";

export const RoomTile = (room: Room) =>
  html` <a href="/watch/${room.id}" title="Navigate to stream"
    ><article class="room-tile-wrapper">
      ${RoomTileImage(room.id)}
      <div class="room-tile-controls">
        ${PlayIcon}
        <div class="room-tile-viewers">
          <span>${room.viewerCount}</span>
          ${ViewerIcon}
        </div>
      </div>
    </article></a
  >`;

const RoomTileImage = (id: number) =>
  html`<div class="room-image-wrapper">
    <img
      src=${getTileImage(id)}
      onerror="this.src='fallback.svg';this.style.objectFit='none'"
      alt="Thumbnail image"
    />
  </div> `;

function getTileImage(id: number): string {
  const fileURL = new URL(`/${id}.webp`, FILE_STORAGE_URL);
  return fileURL.href;
}
