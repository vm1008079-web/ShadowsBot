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

    const { title, video_url, thumbnail, duration, views, published } = data.result;

    const caption = `
🎵 *Título:* ${title}
⏳ *Duración:* ${duration}
👀 *Vistas:* ${views.toLocaleString()}
📅 *Publicado:* ${published}
🔗 *Enlace:* ${video_url}
    `.trim();

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
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
