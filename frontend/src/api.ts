export type RoomData = Room[];
export type Room = {
  id: number;
  viewerCount: number;
};
type RoomDTO = {
  viewer_count: number;
  id: number;
};
export type NotificationDTO = {
  rooms: RoomDTO[];
};
