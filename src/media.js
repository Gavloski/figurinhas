import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { fileTypeFromBuffer } from "file-type";

const MEDIA_KEYS = ["imageMessage", "videoMessage", "stickerMessage"];

function unwrapMessage(message = {}) {
  let current = message;
  for (;;) {
    const wrapped =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.documentWithCaptionMessage?.message;
    if (!wrapped) return current;
    current = wrapped;
  }
}

export function getText(message = {}) {
  const content = unwrapMessage(message);
  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    ""
  ).trim();
}

export function findMedia(message = {}) {
  const content = unwrapMessage(message);
  for (const key of MEDIA_KEYS) {
    if (content[key]) return { key, media: content[key] };
  }
  const quoted = content.extendedTextMessage?.contextInfo?.quotedMessage;
  return quoted ? findMedia(quoted) : null;
}

export function validateMedia(found, config) {
  if (!found) {
    throw new Error("Envie uma imagem, vídeo ou GIF com o comando, ou responda a uma mídia.");
  }

  const { key, media } = found;
  const size = Number(media.fileLength || 0);
  if (size > config.maxFileBytes) {
    throw new Error("O arquivo ultrapassa o limite de " + Math.round(config.maxFileBytes / 1024 / 1024) + " MB.");
  }

  if (key === "videoMessage" && Number(media.seconds || 0) > config.maxVideoSeconds) {
    throw new Error("O vídeo deve ter no máximo " + config.maxVideoSeconds + " segundos.");
  }

  return found;
}

export async function downloadMedia({ key, media }) {
  const mediaType = key.replace("Message", "");
  const stream = await downloadContentFromMessage(media, mediaType);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);

  const buffer = Buffer.concat(chunks);
  if (!buffer.length) throw new Error("Não foi possível baixar essa mídia.");

  const detected = await fileTypeFromBuffer(buffer);
  const mime = media.mimetype || detected?.mime || "";
  return { buffer, animated: key === "videoMessage" || mime === "image/gif" };
}
