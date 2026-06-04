const video = document.querySelector("video");
const viewerCounter = document.getElementById("viewer-counter");
const pageID = location.pathname.split("/")[2];
const errorDialog = document.getElementById("error-dialog");
const loader = document.getElementById("video-loader");

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

function onConnectionStateChange(event) {
  console.log("connection state change: ", event.target.connectionState);
  switch (event.target.connectionState) {
    case "closed": {
      terminateConnection(event.target);
      console.log("closing connection");
      video.src = null;
      loader.classList.remove("hidden");
      break;
    }
    case "failed": {
      terminateConnection(event.target);
      video.src = null;
      loader.classList.remove("hidden");
      break;
    }
    case "disconnected": {
      loader.classList.remove("hidden");
      break;
    }
    case "connecting": {
      loader.classList.remove("hidden");
      break;
    }
    case "connected": {
      video.play();
      loader.classList.add("hidden");
      break;
    }
  }
}

function terminateConnection(conn) {
  conn.close();
  reconnectRTCP();
}

async function startWhep() {
  const conn = new RTCPeerConnection();

  conn.addTransceiver("audio", { direction: "recvonly" });
  conn.addTransceiver("video", { direction: "recvonly" });
  conn.ontrack = ({ streams }) => {
    video.srcObject = streams[0];
  };
  conn.addEventListener("connectionstatechange", onConnectionStateChange);

  try {
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
  } catch (err) {
    console.error("Error starting WHEP: ", err);
    conn.close();
    reconnectRTCP();
  }
}

connectSSE();
startWhep();

let timeout = 0;
let reconnectTimer;
const BASE_TIMEOUT = 1000;
const MAX_TIMEOUT = 16000;

function reconnectRTCP() {
  console.log("reconnect attempt at timeout: ", timeout);
  if (timeout >= MAX_TIMEOUT) {
    errorDialog.showModal();
    return;
  }
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(startWhep, timeout);
  timeout = Math.max(BASE_TIMEOUT, timeout * 2);
}
