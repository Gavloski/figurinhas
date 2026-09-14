const form = document.querySelector("#stickerForm");
const input = document.querySelector("#media");
const dropzone = document.querySelector("#dropzone");
const emptyState = document.querySelector("#emptyState");
const previewWrap = document.querySelector("#previewWrap");
const imagePreview = document.querySelector("#imagePreview");
const videoPreview = document.querySelector("#videoPreview");
const changeFile = document.querySelector("#changeFile");
const submitButton = document.querySelector("#submitButton");
const status = document.querySelector("#status");
let previewUrl;

function showFile(file) {
  if (!file) return;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  const video = file.type.startsWith("video/");
  imagePreview.hidden = video;
  videoPreview.hidden = !video;
  if (video) {
    videoPreview.src = previewUrl;
    void videoPreview.play();
  } else {
    imagePreview.src = previewUrl;
  }
  emptyState.hidden = true;
  previewWrap.hidden = false;
  status.textContent = file.name + " · " + (file.size / 1024 / 1024).toFixed(1) + " MB";
  status.className = "status";
}

input.addEventListener("change", () => showFile(input.files[0]));
changeFile.addEventListener("click", (event) => {
  event.preventDefault();
  input.click();
});
["dragenter", "dragover"].forEach((type) => dropzone.addEventListener(type, (event) => {
  event.preventDefault();
  dropzone.classList.add("drag");
}));
["dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (event) => {
  event.preventDefault();
  dropzone.classList.remove("drag");
}));
dropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  showFile(file);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!input.files[0]) return input.click();

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Criando...";
  status.textContent = "Processando sua figurinha. Isso pode levar alguns segundos.";
  status.className = "status";

  try {
    const response = await fetch("/api/sticker", { method: "POST", body: new FormData(form) });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Falha ao criar figurinha.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "figurinha.webp";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "Figurinha criada e baixada!";
    status.className = "status success";
  } catch (error) {
    status.textContent = error.message;
    status.className = "status error";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Criar figurinha";
  }
});
