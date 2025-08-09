import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';

const handler = async (m, { text, conn }) => {
  if (!text) return conn.reply(m.chat, `
❗ *Enlace faltante*
Por favor, utiliza el comando así:
*html https://ejemplo.com*
`.trim(), m);

  const url = text.trim();
  const api = `https://nightapi.is-a.dev/api/htmlextractor?url=${encodeURIComponent(url)}`;

  await conn.reply(m.chat, `
⌛ *Procesando solicitud...*
Extrayendo contenido HTML del enlace proporcionado, por favor espere.
`.trim(), m);

  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const buffer = await res.buffer();

    const filename = `hanako-html-${Date.now()}.zip`;
    const filepath = path.join('./temp', filename);

    writeFileSync(filepath, buffer);

    await conn.sendMessage(m.chat, {
      document: { url: filepath },
      mimetype: 'application/zip',
      fileName: 'html-source.zip',
      caption: `
✅ *Extracción completada con éxito*
Archivo ZIP con el código fuente HTML del enlace:
🌐 ${url}
`.trim()
    }, { quoted: m });

    unlinkSync(filepath);

  } catch (error) {
    console.error('[Error en extracción HTML]', error);
    conn.reply(m.chat, `
❌ *Error al extraer HTML*
No fue posible obtener el contenido solicitado.
Verifique que el enlace sea válido e inténtelo nuevamente.
`.trim(), m);
  }
};

handler.command = ['html'];
handler.help = ['html <enlace>'];
handler.tags = ['tools'];
handler.register = true;

export default handler;