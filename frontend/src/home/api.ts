import { WHEP_URL } from "../config";
import { NotificationDTO, RoomData } from "../api";

const ROOMS_URL = new URL("/rooms", WHEP_URL);

export async function getAvailableRooms(): Promise<RoomData> {
  const notificationDTO = (await fetch(ROOMS_URL).then((res) =>
    res.json(),
  )) as NotificationDTO;
  return notificationDTO.rooms.map((room) => ({
    id: room.id,
    viewerCount: room.viewer_count,
  }));
}
