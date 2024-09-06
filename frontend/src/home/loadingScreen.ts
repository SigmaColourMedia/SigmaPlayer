import { html } from "lit";
import { LoaderIcon } from "../icons/loaderIcon";

export const LoadingScreen = html`
  <div class="screen-wrapper">
    ${LoaderIcon}
    <h2>Getting available streams...</h2>
  </div>
`;
