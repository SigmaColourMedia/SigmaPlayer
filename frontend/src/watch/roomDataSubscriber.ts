import { NOTIFICATION_BUS_URL } from "../config";
import { getAvailableRooms } from "../home/api";
import { NotificationDTO, RoomData } from "../api";

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
  getAvailableRooms();
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
