import { NotificationState, NotificationSubscriber } from "./main";
import { RoomData } from "../api";
import { html, nothing } from "lit";
import { ChevronUpIcon } from "../icons/chevronUpIcon";
import { RoomCarousel } from "../home/roomCarousel";

export function DrawerManager(subscriber: NotificationSubscriber) {
  switch (subscriber.state) {
    case NotificationState.Open:
      return Drawer(subscriber.data);
    default:
      return nothing;
  }
}

function Drawer(roomData: RoomData) {
  return html`<div class="drawer-box">
    <button title="Open drawer" class="drawer-button">${ChevronUpIcon}</button>
    <input class="drawer-input" type="checkbox" />
    <div class="drawer">
      <h2>You might be interested in:</h2>
      ${RoomCarousel(roomData)}
    </div>
  </div>`;
}
