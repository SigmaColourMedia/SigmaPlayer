import { html } from "lit";
import { EmptyListIcon } from "../icons/emptyListIcon";

export const EmptyLobby = html`
  <div class="screen-wrapper">
    ${EmptyListIcon}
    <h2>
      No streams available right now – be the first to go live and start
      streaming!
    </h2>
  </div>
`;
