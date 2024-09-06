import { RoomData } from "./api";
import { html } from "lit";
import { RoomCarousel } from "./roomCarousel";

export function FeaturedStreams(roomData: RoomData) {
  return html`
    <div class="streams-showcase">
      <h2>Featured streams:</h2>
      ${RoomCarousel(roomData)}
    </div>
  `;
}
