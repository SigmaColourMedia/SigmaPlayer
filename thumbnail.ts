import path from "node:path";
import fs from "node:fs/promises";

const dir = path.join(path.resolve(), "thumbnails");
const MAX_TTL_TIME = 1000 * 60 * 5; // 5 minutes

export async function handleThumbnailEvent(uuid: string) {
  const lastUpdateTime = await getLastUpdateTime(uuid);
  const firstTimeImage = lastUpdateTime == null;

  if (firstTimeImage || Date.now() - lastUpdateTime >= MAX_TTL_TIME) {
    await fetchThumbnail(uuid);
    if (firstTimeImage) await notifyDiscord(uuid);
  }
}

async function fetchThumbnail(uuid: string) {
  try {
    const getThumbnailURL = new URL("thumbnail", "http://localhost:8080");
    getThumbnailURL.searchParams.set("room_id", uuid);
    const imgData = await fetch(getThumbnailURL).then((res) => res.body!);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${uuid}.webp`), imgData);
    console.log("fetching image");
  } catch (err) {
    console.error("Failed to fetch thumbnail ", err);
  }
}

async function notifyDiscord(uuid: string) {
  const roomURL = new URL(`/watch/${uuid}`, process.env.HOST_URL);
  const imageURL = new URL(`/images/${uuid}.webp`, process.env.HOST_URL);

  const payload = {
    flags: 32768,
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `Nowy strumyczek pod ${roomURL.href}`,
          },
        ],
        accessory: {
          type: 2,
          style: 5,
          label: "Strumyczek",
          url: roomURL.href,
        },
      },
      {
        type: 12,
        items: [
          {
            spoiler: false,
            description: "To może być silksong",
            media: {
              url: imageURL,
            },
          },
        ],
      },
    ],
  };

  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Error calling Discord webhook: ", err);
  }
}

async function getLastUpdateTime(uuid: string): Promise<number | null> {
  const pathname = path.join(dir, `${uuid}.webp`);
  return fs
    .stat(pathname)
    .then((stats) => stats.mtime.valueOf())
    .catch(() => null);
}
