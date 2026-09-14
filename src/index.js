import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { config } from "./config.js";
import { downloadMedia, findMedia, getText, validateMedia } from "./media.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
let reconnectTimer;

const helpText = [
  "🤖 *Sticker Bot*",
  "",
  "• Envie imagem, vídeo ou GIF com *" + config.prefix + "s*",
  "• Ou responda a uma mídia com *" + config.prefix + "s*",
  "• Vídeos: até " + config.maxVideoSeconds + " segundos",
  "• Ajuda: *" + config.prefix + "ajuda*",
].join("\n");

function normalizeCommand(text) {
  return text.toLowerCase().split(/\s+/)[0];
}

async function createSticker(buffer, animated) {
  const sticker = new Sticker(buffer, {
    pack: config.stickerPack,
    author: config.stickerAuthor,
    type: StickerTypes.FULL,
    quality: animated ? 55 : 80,
  });
  return sticker.toBuffer();
}

async function handleMessage(socket, event) {
  const message = event.messages?.[0];
  if (!message?.message || message.key.fromMe || message.key.remoteJid === "status@broadcast") return;

  const chatId = message.key.remoteJid;
  const command = normalizeCommand(getText(message.message));
  const helpCommands = [config.prefix + "ajuda", config.prefix + "help", config.prefix + "menu"];
  const stickerCommands = [config.prefix + "s", config.prefix + "sticker", config.prefix + "figurinha"];

  if (helpCommands.includes(command)) {
    await socket.sendMessage(chatId, { text: helpText }, { quoted: message });
    return;
  }
  if (!stickerCommands.includes(command)) return;

  try {
    await socket.sendPresenceUpdate("composing", chatId);
    const found = validateMedia(findMedia(message.message), config);
    const { buffer, animated } = await downloadMedia(found);
    const sticker = await createSticker(buffer, animated);
    await socket.sendMessage(chatId, { sticker }, { quoted: message });
  } catch (error) {
    logger.error({ err: error }, "Falha ao criar figurinha");
    await socket.sendMessage(
      chatId,
      { text: "❌ " + (error.message || "Não consegui criar a figurinha.") },
      { quoted: message },
    );
  } finally {
    await socket.sendPresenceUpdate("paused", chatId);
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();
  const socket = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["Sticker Bot", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  socket.ev.on("creds.update", saveCreds);
  socket.ev.on("messages.upsert", (event) => {
    if (event.type === "notify") void handleMessage(socket, event);
  });

  socket.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\nLeia o QR Code em WhatsApp > Aparelhos conectados:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") logger.info("Bot conectado ao WhatsApp.");

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error("Sessão desconectada. Apague auth/ e leia um novo QR Code.");
        return;
      }
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(startBot, 3000);
    }
  });
}

startBot().catch((error) => {
  logger.fatal({ err: error }, "Não foi possível iniciar o bot.");
  process.exitCode = 1;
});
