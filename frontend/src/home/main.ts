import { html, LitElement } from "lit";
import HomeStyles from "./styles/home.css" assert { type: "css" };
import { customElement, property } from "lit/decorators.js";
import { ErrorScreen } from "./errorScreen";
import { LoadingScreen } from "./loadingScreen";
import { getAvailableRooms, mockRooms, RoomData } from "./api";
import { EmptyLobby } from "./emptyLobby";
import { RoomTile } from "./roomTile";
import { RoomCarousel } from "./roomCarousel";
import { FeaturedStreams } from "./featuredStreams";

enum AppState {
  Preparing,
  Empty,
  Error,
  Idle,
}

type ServiceState =
  | {
      state: AppState.Idle;
      data: RoomData;
    }
  | {
      state: AppState.Empty | AppState.Preparing | AppState.Error;
    };

@customElement("s-home")
export class Home extends LitElement {
  static styles = HomeStyles;

  @property() serviceState: ServiceState = { state: AppState.Preparing };

  connectedCallback() {
    super.connectedCallback();
    this.initAppState();
  }

  async initAppState() {
    try {
      const rooms = await getAvailableRooms();
      const isLobbyEmpty = rooms.length === 0;

      this.serviceState = isLobbyEmpty
        ? {
            state: AppState.Empty,
          }
        : {
            state: AppState.Idle,
            data: rooms,
          };
    } catch (err) {
      console.error(err);
      this.serviceState = {
        state: AppState.Error,
      };
    }
  }

  render() {
    switch (this.serviceState.state) {
      case AppState.Preparing:
        return html`<main>${LoadingScreen}</main>`;
      case AppState.Empty:
        return html`<main>${EmptyLobby}</main>`;
      case AppState.Error:
        return html`<main>${ErrorScreen}</main>`;
      case AppState.Idle:
        return html`<main>
          <div class="content-wrapper">
            ${FeaturedStreams(this.serviceState.data)}
          </div>
        </main>`;
    }
  }
}
