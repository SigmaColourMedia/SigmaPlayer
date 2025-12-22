const video = document.querySelector('video');
const viewerCounter = document.getElementById('viewer-counter');
const pageID = location.pathname.split('/')[2];
const offlineDialog = document.getElementById('offline-dialog');
const errorDialog = document.getElementById('error-dialog');
const loader = document.querySelector('.loader');

let retries = 0;

function connectSSE() {
  const sse = new EventSource(`/events/room?id=${pageID}`);

  sse.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.event) {
      case 'room_update': {
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
  video.poster = '/static/fallback.png';
  video.srcObject = null;
  video.src = null;
  offlineDialog.showModal();
}

async function startWhep() {
  const conn = new RTCPeerConnection();
  console.log(conn);

  conn.addTransceiver('audio', { direction: 'recvonly' });
  conn.addTransceiver('video', { direction: 'recvonly' });
  conn.ontrack = ({ streams }) => {
    video.srcObject = streams[0];
  };

  conn.addEventListener('connectionstatechange', () => {
    retries++;
    switch (conn.connectionState) {
      case 'closed': {
        if (retries < 5) {
          startWhep().then(() => {
            video.play();
          });
        } else {
          showSteamCloseDialog();
        }
        break;
      }
      case 'disconnected': {
        showSteamCloseDialog();
        break;
      }
      case 'failed': {
        if (retries < 5) {
          startWhep().then(() => {
            video.play();
          });
        } else {
          showSteamCloseDialog();
        }
        break;
      }
      case 'connecting': {
        loader.classList.toggle('hidden');
        break;
      }
      case 'connected': {
        loader.classList.toggle('hidden');
        retries = 0;
        break;
      }
    }
  });

  const sdp_offer = await conn.createOffer();
  await conn.setLocalDescription(sdp_offer);

  const sdp_answer = await fetch(`/whep?target_id=${pageID}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/sdp',
    },
    body: sdp_offer.sdp,
  }).then((res) => res.text());

  await conn.setRemoteDescription({ sdp: sdp_answer, type: 'answer' });
}

connectSSE();
startWhep().catch((err) => {
  console.error('RTC setup error: ', err);
  errorDialog.showModal();
});
