import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";

const streamPipe = promisify(pipeline);

const pending = {};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;

  const text =
    (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();

  if (!text) {
    let pref = ".";
    try {
      const subID = (conn.user.id || "").split(":")[0] + "@s.whatsapp.net";
      const p = JSON.parse(fs.readFileSync("prefixes.json", "utf8"));
      pref = p[subID] || ".";
    } catch {}

    return await conn.sendMessage(
      chatId,
      {
        text: `✳️ Usa:\n${pref}playpro <término>\nEjemplo: ${pref}playpro bad bunny diles`,
      },
      { quoted: msg }
    );
  }

  await conn.sendMessage(chatId, {
    react: { text: "⏳", key: msg.key },
  });

  const res = await yts(text);
  const video = res.videos[0];
  if (!video)
    return await conn.sendMessage(
      chatId,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    );

  const { url, title, timestamp, views, author, thumbnail } = video;

  const caption = `
📀 Info del video:
🎼 Título: ${title}
⏱️ Duración: ${timestamp}
👁️ Vistas: ${views.toLocaleString()}
👤 Autor: ${author}
🔗 Link: ${url}

📥 Opciones para descargar (responde o reacciona):
1️⃣ Audio MP3
2️⃣ Video MP4
3️⃣ Audio Doc
4️⃣ Video Doc
`.trim();

  const preview = await conn.sendMessage(
    chatId,
    {
      image: { url: thumbnail },
      caption,
    },
    { quoted: msg }
  );

  pending[preview.key.id] = {
    chatId,
    videoUrl: url,
    title,
    commandMsg: msg,
  };

  if (!conn._playproListener) {
    conn._playproListener = true;
    conn.ev.on("messages.upsert", async ({ messages }) => {
      for (const m of messages) {
        try {
          const context = m.message?.extendedTextMessage?.contextInfo;
          const citedId = context?.stanzaId;
          const textMsg = (
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            ""
          )
            .toLowerCase()
            .trim();

          const job = pending[citedId];
          if (!job) continue;

          const chat = m.key.remoteJid;
          const quoted = m;

          if (["1", "audio", "3", "audiodoc"].includes(textMsg)) {
            const isDoc = ["3", "audiodoc"].includes(textMsg);
            await conn.sendMessage(chat, {
              react: { text: isDoc ? "📄" : "🎵", key: m.key },
            });
            await conn.sendMessage(
              chat,
              { text: `🔊 Descargando audio...` },
              { quoted }
            );
            await downloadAudio(conn, job, isDoc, quoted);
          } else if (["2", "video", "4", "videodoc"].includes(textMsg)) {
            const isDoc = ["4", "videodoc"].includes(textMsg);
            await conn.sendMessage(chat, {
              react: { text: isDoc ? "📁" : "🎬", key: m.key },
            });
            await conn.sendMessage(
              chat,
              { text: `📽️ Descargando video...` },
              { quoted }
            );
            await downloadVideo(conn, job, isDoc, quoted);
          }
        } catch (e) {
          console.error("Error en listener:", e);
        }
      }
    });
  }
};

async function downloadAudio(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  const api = `https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(
    videoUrl
  )}`;
  const res = await axios.get(api);
  const data = res.data?.result;
  if (!data || !data.audio) throw new Error("No se pudo descargar el audio");

  const audioResp = await axios.get(data.audio, { responseType: "arraybuffer" });
  const buffer = Buffer.from(audioResp.data);

  await conn.sendMessage(chatId, {
    [asDocument ? "document" : "audio"]: buffer,
    mimetype: "audio/mpeg",
    fileName: `${data.filename || title}.mp3`,
  }, { quoted });
}

async function downloadVideo(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  // Aquí asumí que tu API también tiene endpoint para video (ytmp4) pero si no, habría que cambiar
  // Intento con calidad 720p -> 480p -> 360p
  const qualities = ["720p", "480p", "360p"];
  let videoUrlFinal = null;
  for (let q of qualities) {
    try {
      const res = await axios.get(
        `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(videoUrl)}&q=${q}`
      );
      if (res.data?.result?.url) {
        videoUrlFinal = res.data.result.url;
        break;
      }
    } catch {}
  }

  if (!videoUrlFinal) throw new Error("No se pudo descargar el video");

  const videoResp = await axios.get(videoUrlFinal, { responseType: "arraybuffer" });
  const buffer = Buffer.from(videoResp.data);

  await conn.sendMessage(chatId, {
    [asDocument ? "document" : "video"]: buffer,
    mimetype: "video/mp4",
    fileName: `${title}.mp4`,
    caption: asDocument ? undefined : "🎬 Aquí tienes tu video",
  }, { quoted });
}

handler.command = ["fplay"];
export default handler;