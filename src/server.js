import express from "express";
import multer from "multer";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

const app = express();
const port = Number(process.env.PORT) || 3000;
const maxFileMb = Number(process.env.MAX_FILE_MB) || 20;
const maxBytes = maxFileMb * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_request, file, callback) => {
    callback(allowedTypes.has(file.mimetype) ? null : new Error("Formato não suportado."), allowedTypes.has(file.mimetype));
  },
});

app.disable("x-powered-by");
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/sticker", upload.single("media"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: "Selecione uma imagem, GIF ou vídeo." });

    const pack = String(request.body.pack || "Gavloski").trim().slice(0, 40);
    const author = String(request.body.author || "Sticker Maker").trim().slice(0, 40);
    const isAnimated = request.file.mimetype === "image/gif" || request.file.mimetype.startsWith("video/");

    const sticker = new Sticker(request.file.buffer, {
      pack,
      author,
      type: StickerTypes.FULL,
      quality: isAnimated ? 55 : 82,
    });

    const output = await sticker.toBuffer();
    response
      .status(200)
      .set({
        "Content-Type": "image/webp",
        "Content-Disposition": 'attachment; filename="figurinha.webp"',
        "Cache-Control": "no-store",
      })
      .send(output);
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  const tooLarge = error?.code === "LIMIT_FILE_SIZE";
  console.error(error);
  response.status(tooLarge ? 413 : 500).json({
    error: tooLarge
      ? "O arquivo ultrapassa o limite de " + maxFileMb + " MB."
      : error.message || "Não foi possível criar a figurinha.",
  });
});

app.listen(port, () => {
  console.log("Sticker Maker disponível em http://localhost:" + port);
});
