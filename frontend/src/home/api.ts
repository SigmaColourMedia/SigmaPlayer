import { NotificationDTO, RoomData } from "../api";
import { SMID_URL } from "../config";

const ROOMS_URL = new URL("/rooms", SMID_URL);

export async function getAvailableRooms(): Promise<RoomData> {
  const notificationDTO = (await fetch(ROOMS_URL).then((res) =>
    res.json(),
  )) as NotificationDTO;
  return notificationDTO.rooms.map((room) => ({
    id: room.id,
    viewerCount: room.viewer_count,
  }));
}
