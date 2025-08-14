import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`> 🎶 Ingresa el nombre de la música o video que deseas reproducir.\n\n` + `\`Ejemplo:\`\n> *${usedPrefix + command}* Alan Walker Faded`);
  }

  await m.react('🎶');
  try {
    const api_url = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(text)}`;
    const { data } = await axios.get(api_url);

    if (!data.status || !data.result) {
      return m.reply(`❌ No se encontró ningún resultado para la búsqueda: *${text}*`);
    }

    const { title, download_url } = data.result;

    const caption = `
🎵 *Reproduciendo:* ${title}

🎧 *Si no se reproduce, descarga el archivo.*
    `.trim();

    await conn.sendMessage(m.chat, {
      audio: { url: download_url },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mp4', // Se envía como MP4 con audio
      ptt: true, // Envía como nota de voz
      caption: caption,
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('✖️');
    await m.reply('❌ Ocurrió un error al procesar tu solicitud. Intenta de nuevo más tarde.');
  }
};

handler.help = ['play4 *<búsqueda>*'];
handler.tags = ['downloader', 'tools'];
handler.command = ['play4'];
handler.register = false;
export default handler;
