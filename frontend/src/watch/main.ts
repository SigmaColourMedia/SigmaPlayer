import { customElement, property, query, state } from "lit/decorators.js";
import { html, LitElement, nothing } from "lit";
import WatchStyles from "./styles/watch.css" assert { type: "css" };
import RoomStyles from "../styles/roomTiles.css" assert { type: "css" };

import { createRTCConnection, getStreamSDPAnswer } from "./api";
import { LoaderIcon } from "../icons/loaderIcon";
import { EmptyListIcon } from "../icons/emptyListIcon";
import { ConnectionLostIcon } from "../icons/connectionLostIcon";
import { PlayIcon } from "../icons/playIcon";
import { FooterManager } from "./footer";
import { RoomData } from "../api";
import { createRoomDataSubscriber } from "./roomDataSubscriber";
import { DrawerManager } from "./drawer";
import { getAvailableRooms } from "../home/api";

enum AppState {
  EstablishRTC,
  LoadingVideo,
  Playing,
  VideoPaused,
  NotFound,
  RTCError,
}

export enum NotificationState {
  Open,
  Loading,
  Closed,
}

export type NotificationSubscriber =
  | {
      state: NotificationState.Closed | NotificationState.Loading;
    }
  | {
      state: NotificationState.Open;
      data: RoomData;
    };

@customElement("s-watch")
export class Watch extends LitElement {
  static styles = [WatchStyles, RoomStyles];

  @property()
  id: string;
  @query("video")
  video: HTMLVideoElement;
  @query(".video-wrapper")
  video_wrapper: HTMLDivElement;

  @state()
  appState: AppState = AppState.EstablishRTC;

  @state()
  notificationSubscriber: NotificationSubscriber = {
    state: NotificationState.Loading,
  };

  connectedCallback() {
    super.connectedCallback();
    this.initNotificationSubscriber();
    this.initRTCStream();
  }

  async initRTCStream() {
    try {
      const conn = await createRTCConnection();
      conn.ontrack = ({ streams }) => {
        this.appState = AppState.LoadingVideo;
        this.video.srcObject = streams[0];
        this.video.onloadeddata = () => {
          this.appState = AppState.VideoPaused;
          this.video.style.visibility = "visible";
        };
        this.video.onpause = () => {
          this.appState = AppState.VideoPaused;
        };
        this.video.onplay = () => {
          this.appState = AppState.Playing;
        };
      };

      const sdp_offer = await createOffer(conn);

      const sdp_answer = await getStreamSDPAnswer(sdp_offer, this.id);
      if (sdp_answer == null) {
        this.appState = AppState.NotFound;
        return;
      }

      await conn.setRemoteDescription({ sdp: sdp_answer, type: "answer" });
    } catch {
      this.appState = AppState.RTCError;
    }
  }

  async initNotificationSubscriber() {
    try {
      const data = await getAvailableRooms();
      this.notificationSubscriber = {
        state: NotificationState.Open,
        data,
      };
    } catch {
      this.notificationSubscriber = {
        state: NotificationState.Closed,
      };
    }
  }

  render() {
    return html`<main>
      <div class="content-wrapper">
        <div class="video-wrapper">
          ${AppStateHeading(this.appState)}
        <video class="${this.appState == AppState.VideoPaused ? "video-paused" : ""}" controls>
        </div>
        ${FooterManager(this.notificationSubscriber, Number(this.id))}
        ${DrawerManager.call(this, this.notificationSubscriber)}
      </div>
    </main>`;
  }
}

function AppStateHeading(appState: AppState) {
  switch (appState) {
    case AppState.EstablishRTC:
      return html`<div class="app-state-heading">
        ${LoaderIcon}
        <h2>Establishing RTC Connection with the remote host...</h2>
      </div>`;
    case AppState.LoadingVideo:
      return html`<div class="app-state-heading">
        ${LoaderIcon}
        <h2>Loading stream...</h2>
      </div>`;
    case AppState.NotFound:
      return html`<div class="app-state-heading">
        ${EmptyListIcon}
        <h2>404 Stream not found</h2>
      </div>`;
    case AppState.RTCError:
      return html`<div class="app-state-heading">
        ${ConnectionLostIcon}
        <h2>Error establishing connection with the RTC host</h2>
      </div>`;
    case AppState.VideoPaused:
      return html`<div class="play-wrapper">${PlayIcon}</div>`;
    case AppState.Playing:
      return nothing;
  }
}

async function createOffer(rtcConnection: RTCPeerConnection): Promise<string> {
  const sdp_offer = await rtcConnection.createOffer();
  if (!sdp_offer.sdp) {
    throw new Error("Offer should have an sdp defined");
  }

  await rtcConnection.setLocalDescription(sdp_offer);
  return sdp_offer.sdp;
}
