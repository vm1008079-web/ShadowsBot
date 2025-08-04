import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted || m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `📎 Por favor responde a un archivo válido (imagen, video, documento, etc).`, m, rcanal);

  await m.react('🕒');

  try {
    let media = await q.download();
    let linkData = await maybox(media, mime);

    if (!linkData?.data?.url) throw '❌ No se pudo subir el archivo';

    await conn.reply(m.chat, linkData.data.url, m, rcanal);
    await m.react('✅');
  } catch (err) {
    console.error(err);
    await m.react('❌');
    await conn.reply(m.chat, `🚫 Hubo un error al subir el archivo a Files de Adonix. Intenta de nuevo más tarde.`, m, rcanal);
  }
};

handler.command = ['tourl'];
handler.help = ['tourl'];
handler.tags = ['tools'];
export default handler;

// --- Funciones auxiliares ---
async function maybox(content, mime) {
  const { ext } = (await fileTypeFromBuffer(content)) || { ext: 'bin' };
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const form = new FormData();
  const filename = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  form.append('file', blob, filename);

  const res = await fetch('https://wirksibox.onrender.com/api/upload', {
    method: 'POST',
    body: form,
    headers: {
      'User-Agent': 'Michi-WaBot',
    }
  });

  return await res.json();
}