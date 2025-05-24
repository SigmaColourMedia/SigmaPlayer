import z from "zod";

type RPCEvent = z.infer<typeof rpcEventSchema>;

export function parseRPCEvent(data: Buffer<ArrayBufferLike>): RPCEvent | null {
  try {
    const json = JSON.parse(data.toString());
    return rpcEventSchema.parse(json);
  } catch {
    return null;
  }
}

const roomChangeSchema = z.object({
  method: z.literal("room_change"),
  params: z.object({
    uuid: z.string(),
    viewer_count: z.number(),
  }),
});

const newRoomSchema = z.object({
  method: z.literal("new_room"),
  params: z.object({
    uuid: z.string(),
  }),
});

const newThumbnailSchema = z.object({
  method: z.literal("new_thumbnail"),
  params: z.object({
    uuid: z.string(),
  }),
});

const terminateRoomSchema = z.object({
  method: z.literal("terminate_room"),
  params: z.object({
    uuid: z.string(),
  }),
});

const rpcEventSchema = z.discriminatedUnion("method", [
  roomChangeSchema,
  newRoomSchema,
  newThumbnailSchema,
  terminateRoomSchema,
]);
