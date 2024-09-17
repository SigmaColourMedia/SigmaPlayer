import { html, LitElement } from "lit";
import HomeStyles from "./styles/home.css" assert { type: "css" };
import { customElement, state } from "lit/decorators.js";
import { ErrorScreen } from "./errorScreen";
import { LoadingScreen } from "./loadingScreen";
import { EmptyLobby } from "./emptyLobby";
import { FeaturedStreams } from "./featuredStreams";
import { RoomData } from "../api";
import { NotificationState } from "../watch/main";
import { createRoomDataSubscriber } from "../watch/roomDataSubscriber";

export type NotificationSubscriber =
  | {
      state: NotificationState.Closed | NotificationState.Loading;
    }
  | {
      state: NotificationState.Open;
      data: RoomData;
    };

@customElement("s-home")
export class Home extends LitElement {
  static styles = HomeStyles;

  @state()
  notificationSubscriber: NotificationSubscriber = {
    state: NotificationState.Loading,
  };
  connectedCallback() {
    super.connectedCallback();
    this.initNotificationSubscriber();
  }

  initNotificationSubscriber() {
    createRoomDataSubscriber({
      onData: (data) => {
        this.notificationSubscriber = {
          state: NotificationState.Open,
          data,
        };
      },
      onOpen: () => {
        this.notificationSubscriber = {
          state: NotificationState.Loading,
        };
      },
      onError: () => {
        this.notificationSubscriber = {
          state: NotificationState.Closed,
        };
      },
    });
  }

  render() {
    switch (this.notificationSubscriber.state) {
      case NotificationState.Loading:
        return html`<main>${LoadingScreen}</main>`;
      case NotificationState.Closed:
        return html`<main>${ErrorScreen}</main>`;
      case NotificationState.Open: {
        const isEmptyLobby = this.notificationSubscriber.data.length === 0;
        if (isEmptyLobby) return html`<main>${EmptyLobby}</main>`;
        return html`<main>
          <div class="content-wrapper">
            ${FeaturedStreams(this.notificationSubscriber.data)}
          </div>
        </main>`;
      }
    }
  }
}
