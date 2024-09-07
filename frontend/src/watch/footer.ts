import { html, nothing } from "lit";
import { ViewerIcon } from "../icons/viewerIcon";
import { NotificationState, NotificationSubscriber } from "./main";

export function FooterManager(
  subscriber: NotificationSubscriber,
  roomID: number,
) {
  switch (subscriber.state) {
    case NotificationState.Closed:
      return nothing;
    case NotificationState.Loading:
      return html`<div class="footer">
        <div class="pulse">${ViewerIcon}</div>
      </div>`;
    case NotificationState.Open: {
      const matchedRoom = subscriber.data.find((room) => room.id === roomID);

      if (!matchedRoom) return nothing;

      return html`
        <div class="footer">
          <span>${matchedRoom.viewerCount}</span>${ViewerIcon}
        </div>
      `;
    }
  }
}
