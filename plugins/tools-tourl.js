import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

/**
 * Comando para subir archivos a Catbox
 */
let handler = async (m, { conn }) => {
  const STATUS_WAIT = "⏳";
  const STATUS_DONE = "✅";
  const STATUS_ERROR = "❌";
  const CREDIT_TEXT = "Made with Ado";

  const quotedMsg = m.quoted ? m.quoted : m;
  const mime = (quotedMsg.msg || quotedMsg).mimetype || "";

  if (!mime) {
    return conn.reply(
      m.chat,
      `${STATUS_ERROR} Responde a un archivo válido (imagen, video, audio, etc.).`,
      m
    );
  }

  await m.react(STATUS_WAIT);

  try {
    const mediaBuffer = await quotedMsg.download();
    if (!mediaBuffer) throw new Error("No se pudo descargar el archivo.");

    const isPermanent = /image\/(png|jpe?g|gif)|video\/mp4|audio\/(mpeg|ogg|mp4)/.test(mime);
    const link = await uploadToCatbox(mediaBuffer);

    const message = [
      `CATBOX UPLOADER`,
      ``,
      `Enlace: ${link}`,
      `Tamaño: ${formatBytes(mediaBuffer.length)}`,
      `Expiración: ${isPermanent ? "No expira" : "Desconocido"}`,
      ``,
      `${CREDIT_TEXT}`
    ].join("\n");

    await conn.sendFile(m.chat, mediaBuffer, "uploaded_file", message, m);
    await m.react(STATUS_DONE);

  } catch (err) {
    console.error("Error al subir a Catbox:", err);
    await m.react(STATUS_ERROR);
    conn.reply(m.chat, `${STATUS_ERROR} Error al subir el archivo.`, m);
  }
};

handler.help = ["tourl"];
handler.tags = ["tools"];
handler.command = ["catbox", "tourl"];
export default handler;

/**
 * Convierte bytes a formato legible
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Sube un archivo a Catbox
 */
async function uploadToCatbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  if (!ext || !mime) throw new Error("Tipo de archivo no reconocido.");

  const blob = new Blob([content.buffer], { type: mime });
  const formData = new FormData();
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${ext}`;

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, fileName);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.text();
}