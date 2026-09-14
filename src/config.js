import "dotenv/config";

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = Object.freeze({
  prefix: process.env.PREFIX || "!",
  stickerPack: process.env.STICKER_PACK || "Gavloski",
  stickerAuthor: process.env.STICKER_AUTHOR || "Sticker Bot",
  maxVideoSeconds: positiveNumber(process.env.MAX_VIDEO_SECONDS, 10),
  maxFileBytes: positiveNumber(process.env.MAX_FILE_MB, 20) * 1024 * 1024,
});
