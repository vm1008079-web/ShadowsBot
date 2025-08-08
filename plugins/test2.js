import axios from 'axios';

const handler = async (m, { conn, text, prefix, command }) => {
  try {
    if (!text) return m.reply(`> * » 🫟🌤 Ejemplo:* ${prefix + command} enlace_de_mediafire`);
    if (!text.includes('mediafire.com')) return m.reply('> * » 🫟🌤 El enlace debe ser de Mediafire!');

    // Reacción inicial 🕓
    await conn.sendMessage(m.chat, { react: { text: "🕓", key: m.key } });

    const { data } = await axios.get(`https://api.vreden.web.id/api/mediafiredl?url=${text}`);
    const res = data.result[0];

    const file_name = decodeURIComponent(res.nama);
    const extension = file_name.split('.').pop().toLowerCase();

    const response = await axios.get(res.link, { responseType: 'arraybuffer' });
    const media = Buffer.from(response.data);

    let mimetype = '';
    if (extension === 'mp4') mimetype = 'video/mp4';
    else if (extension === 'mp3') mimetype = 'audio/mp3';
    else mimetype = `application/${extension}`;

    await conn.sendMessage(m.chat, {
      document: media,
      fileName: file_name,
      mimetype: mimetype
    }, { quoted: m });

    // Mensaje final con ✅
    await m.reply('> * » 🫟🌤 ✅ Descarga completada');

  } catch (err) {
    console.error(err.message);
    m.reply('> * » 🫟🌤 ❌ Error al procesar el enlace');
  }
};

handler.command = ["mediafiredl"];

export default handler;