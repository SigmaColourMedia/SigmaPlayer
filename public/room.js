const video = document.querySelector('video');
const viewerCounter = document.getElementById('viewer-counter');
const pageID = location.pathname.split('/')[2];
const errorDialog = document.getElementById('error-dialog');
const loader = document.querySelector('.loader');


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


let timeout = 0;
const BASE_TIMEOUT = 1000;
const MAX_TIMEOUT = 16000;

const startWhepEventKey = "startwhep"
const reconnectWhepEventKey = "reconnectwhep"

const target = new EventTarget();
target.addEventListener("startwhep", (event) => {
    startWhep().catch(() => {
        target.dispatchEvent(new Event(reconnectWhepEventKey))
    });
})
target.addEventListener(reconnectWhepEventKey, (event) => {
    if (timeout < MAX_TIMEOUT) {
        setTimeout(() => startWhep().catch(() => {
            target.dispatchEvent(new Event(reconnectWhepEventKey))
        }), timeout)
        // First reconnect should have no timeout
        timeout = Math.max(BASE_TIMEOUT, timeout * 2);
    } else {
        // Reconnection failed
        errorDialog.showModal()
    }
})

async function startWhep() {
    const conn = new RTCPeerConnection();

    conn.addTransceiver('audio', {direction: 'recvonly'});
    conn.addTransceiver('video', {direction: 'recvonly'});
    conn.ontrack = ({streams}) => {
        video.srcObject = streams[0];
    };

    conn.addEventListener('connectionstatechange', () => {
        switch (conn.connectionState) {
            case 'closed': {
                target.dispatchEvent(new Event(reconnectWhepEventKey))
                console.warn('closed');
                break;
            }
            case 'disconnected': {
                target.dispatchEvent(new Event(reconnectWhepEventKey))
                console.warn('disconnected');
                break;
            }
            case 'failed': {
                target.dispatchEvent(new Event(reconnectWhepEventKey))
                console.warn('failed');
                break;
            }
            case 'connecting': {
                loader.classList.toggle('hidden');
                break;
            }
            case 'connected': {
                timeout = 0;
                loader.classList.toggle('hidden');
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

    await conn.setRemoteDescription({sdp: sdp_answer, type: 'answer'});
}

connectSSE();
target.dispatchEvent(startWhepEventKey)