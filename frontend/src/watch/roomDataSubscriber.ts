import { getAvailableRooms } from "../home/api";
import { NotificationDTO, RoomData } from "../api";
import { SINDER_URL } from "../config";

const NOTIFICATION_BUS_URL = new URL("/notifications", SINDER_URL);

type OnData = (data: RoomData) => any;
type Config = {
  onData?: OnData;
  onError?: () => void;
  onOpen?: () => void;
};
const mockFunc = () => {};
export function createRoomDataSubscriber({
  onData = mockFunc,
  onOpen = mockFunc,
  onError = mockFunc,
}: Config) {
  const sink = new EventSource(NOTIFICATION_BUS_URL);

  sink.onmessage = (message: MessageEvent<string>) => {
    const notificationDTO = JSON.parse(message.data) as NotificationDTO;

    onData(mapToRoomData(notificationDTO));
  };
  sink.onopen = onOpen;
  sink.onerror = onError;
}

function mapToRoomData(input: NotificationDTO): RoomData {
  return input.rooms.map((room) => ({
    id: room.id,
    viewerCount: room.viewer_count,
  }));
}
