import { html } from "lit";
import { ConnectionLostIcon } from "../icons/connectionLostIcon";

export const ErrorScreen = html`
  <div class="screen-wrapper">
    ${ConnectionLostIcon}
    <h2>Connection Lost</h2>
  </div>
`;
