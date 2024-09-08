import { NotificationState, NotificationSubscriber, Watch } from "./main";
import { RoomData } from "../api";
import { html, nothing } from "lit";
import { ChevronUpIcon } from "../icons/chevronUpIcon";
import { RoomCarousel } from "../home/roomCarousel";

export function DrawerManager(this: Watch, subscriber: NotificationSubscriber) {
  switch (subscriber.state) {
    case NotificationState.Open:
      return Drawer.call(this, subscriber.data);
    default:
      return nothing;
  }
}

function Drawer(this: Watch, roomData: RoomData) {
  const hasNoRooms =
    roomData.filter((room) => room.id !== Number(this.id)).length == 0;

  if (hasNoRooms)
    return html`<div class="drawer-box">
      <button title="Open drawer" class="drawer-button">
        ${ChevronUpIcon}
      </button>
      <input disabled class="drawer-input" type="checkbox" />
    </div>`;

  return html`<div class="drawer-box">
    <button title="Open drawer" class="drawer-button">${ChevronUpIcon}</button>
    <input class="drawer-input" type="checkbox" />
    <div class="drawer">
      <h2>You might be interested in:</h2>
      ${RoomCarousel(roomData)}
    </div>
  </div>`;
}
