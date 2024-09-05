import { html } from "lit";

export const ErrorScreen = html`
  <div class="screen-wrapper">
    <svg
      class="pulse"
      xmlns="http://www.w3.org/2000/svg"
      height="80px"
      viewBox="0 -960 960 960"
      width="80px"
      fill="#e8eaed"
    >
      <path
        d="m676-140-56-56 84-84-84-84 56-56 84 84 84-84 57 56-84 84 83 84-56 56-84-83-84 83Zm-196 20L0-600q95-97 219.5-148.5T480-800q136 0 260.5 51.5T960-600L822-463q-14-14-28-28.5T766-520l78-78q-79-60-172-91t-192-31q-99 0-192 31t-172 91l364 364 40-40 28.5 28.5L577-217l-97 97Zm0-357Z"
      />
    </svg>
    <h2>Connection Lost</h2>
  </div>
`;