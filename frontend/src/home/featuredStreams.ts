import { html } from "lit";
import { RoomCarousel } from "./roomCarousel";
import { RoomData } from "../api";

export function FeaturedStreams(roomData: RoomData) {
  return html`
    <div class="streams-showcase">
      <h2>Featured streams:</h2>
      ${RoomCarousel(roomData)}
    </div>
  `;
}
