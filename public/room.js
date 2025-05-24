const video = document.querySelector("video");
const viewerCounter = document.getElementById("viewer-counter");
const pageID = location.pathname.split("/")[2];
const offlineDialog = document.getElementById("offline-dialog");
const errorDialog = document.getElementById("error-dialog");

function connectSSE() {
  const sse = new EventSource(`/events/room?id=${pageID}`);

  sse.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.event) {
      case "room_update": {
        viewerCounter.textContent = data.payload.viewer_count;
        break;
      }
      default: {
        break;
      }
    }
  };
}

function showSteamCloseDialog() {
  video.poster = "/static/fallback.png";
  video.srcObject = null;
  video.src = null;
  offlineDialog.showModal();
}

console.log(showSteamCloseDialog);

async function startWhep() {
  const conn = new RTCPeerConnection();
  conn.addTransceiver("audio", { direction: "recvonly" });
  conn.addTransceiver("video", { direction: "recvonly" });
  conn.ontrack = ({ streams }) => {
    video.srcObject = streams[0];
  };

  conn.onconnectionstatechange = () => {
    console.log("connection state change to ", conn.connectionState);
    switch (conn.connectionState) {
      case "closed": {
        showSteamCloseDialog();
        break;
      }
      case "disconnected": {
        showSteamCloseDialog();
        break;
      }
      case "failed": {
        showSteamCloseDialog();
        break;
      }
    }
  };

  const sdp_offer = await conn.createOffer();
  await conn.setLocalDescription(sdp_offer);

  const sdp_answer = await fetch(`/whep?target_id=${pageID}`, {
    method: "POST",
    headers: {
      "content-type": "application/sdp",
    },
    body: sdp_offer.sdp,
  }).then((res) => res.text());

  await conn.setRemoteDescription({ sdp: sdp_answer, type: "answer" });
}

connectSSE();
startWhep().catch((err) => {
  console.error("RTC setup error: ", err);
  errorDialog.showModal();
});
