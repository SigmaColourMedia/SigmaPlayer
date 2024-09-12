import { SINDER_URL } from "../config";

const WHEP_ENDPOINT = new URL("/whep", SINDER_URL);

export async function getStreamSDPAnswer(
  sdpOffer: string,
  id: string,
): Promise<string | null> {
  const url = new URL(WHEP_ENDPOINT);
  url.searchParams.set("target_id", id);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/sdp",
    },
    body: sdpOffer,
  });

  console.log(response.status);

  if (response.status == 404) return null;

  return response.text();
}

export async function createRTCConnection(): Promise<RTCPeerConnection> {
  const conn = new RTCPeerConnection();
  conn.addTransceiver("audio", { direction: "recvonly" });
  conn.addTransceiver("video", { direction: "recvonly" });
  return conn;
}
