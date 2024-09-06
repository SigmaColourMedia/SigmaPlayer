import { customElement, property, query, state } from "lit/decorators.js";
import { html, LitElement, nothing } from "lit";
import WatchStyles from "./styles/watch.css" assert { type: "css" };
import { createRTCConnection, getStreamSDPAnswer } from "./api";
import { LoaderIcon } from "../icons/loaderIcon";
import { EmptyListIcon } from "../icons/emptyListIcon";
import { ConnectionLostIcon } from "../icons/connectionLostIcon";
import { PlayIcon } from "../icons/playIcon";

enum AppState {
  EstablishRTC,
  LoadingVideo,
  Playing,
  VideoPaused,
  NotFound,
  RTCError,
}

@customElement("s-watch")
export class Watch extends LitElement {
  static styles = WatchStyles;

  @property()
  id: string;
  @query("video")
  video: HTMLVideoElement;
  @query(".video-wrapper")
  video_wrapper: HTMLDivElement;
  @state()
  is_video_paused = true;

  @state()
  appState: AppState = AppState.EstablishRTC;
  connectedCallback() {
    super.connectedCallback();
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
        this.video.onwaiting = () => console.log("waiting");
        this.video.onstalled = () => console.log("Stalled");
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

  render() {
    console.log(this.appState);
    return html`<main>
      <div class="content-wrapper">
        <div class="video-wrapper">
          ${AppStateHeading(this.appState)}
        <video class="${this.appState == AppState.VideoPaused ? "video-paused" : ""}" controls>
        </div>
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
