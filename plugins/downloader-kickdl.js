// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los creditos

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `❌ Debes proporcionar un enlace de Kick válido.\n\n` +
      `Ejemplo:\n${usedPrefix + command} https://kick.com/usuario/videoID`
    );
  }

  try {
    await m.react('🕓'); // mensaje de espera

    // Llamada a API externa que procese Kick (puedes usar alguna pública si existe)
    // Por ejemplo, usando la API de dorratz si soporta Kick, o cualquier otra
    const response = await fetch(`https://api.dorratz.com/kickdl?url=${encodeURIComponent(text)}`);
    const json = await response.json();

    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      return m.reply('⚠️ No se encontraron archivos para descargar.');
    }

    for (const media of json.data) {
      const fileUrl = media.url;
      const fileType = fileUrl.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
      await conn.sendFile(
        m.chat,
        fileUrl,
        fileType === 'video/mp4' ? 'video.mp4' : 'imagen.jpg',
        `✅ Aquí tienes el video de Kick.`,
        m
      );
    }

    await m.reply('✅ Video(s) de Kick enviados correctamente.');

  } catch (error) {
    console.error('Error en descarga de Kick:', error);
    m.reply('❌ Ocurrió un error al intentar descargar el contenido de Kick.');
  }
};

handler.help = ['kickdl <url>'];
handler.tags = ['downloader'];
handler.command = ['kickdl'];

export default handler;
