// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los creditos

import { File } from "megajs";
import mime from "mime-types";

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`🌦 MichiBot-MD 🍁\nPor favor, ingresa un enlace de Mega.\nEjemplo:\n${usedPrefix + command} https://mega.nz/file/XXXX#KEY`);

    const file = File.fromURL(text);
    await file.loadAttributes();

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = mime.lookup(fileExtension) || 'application/octet-stream';
    const fileSize = formatBytes(file.size);

    // Mostrar info del archivo al usuario
    let caption = `
🌦 MichiBot-MD 🍁
📄 Nombre: ${file.name}
💪 Tamaño: ${fileSize}
🚀 Tipo: ${mimeType}
    `.trim();
    m.reply(caption);

    // Validar tamaño máximo (1.8 GB)
    if (file.size >= 1800000000 && !file.directory) return m.reply('❌ Error: El archivo es muy pesado para enviar.');

    // Descargar y enviar
    const buffer = await file.downloadBuffer();
    await conn.sendFile(m.chat, buffer, file.name, null, m, null, { mimeType, asDocument: true });

  } catch (error) {
    m.reply(`❌ Ocurrió un error: ${error.message}`);
  }
};

handler.help = ['mega <url>'];
handler.tags = ['downloader'];
handler.command = /^(mega|megadl)$/i;
//handler.register = true;

export default handler;
