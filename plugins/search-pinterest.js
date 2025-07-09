import axios from 'axios';

let pinterestCache = {}; // Para guardar temporalmente los resultados por usuario

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = m.sender;

  // Si se usa el botón "siguiente"
  if (text === 'SIGUIENTE_PINTEREST' && pinterestCache[user]) {
    return sendPinterest(conn, m, user, pinterestCache[user]);
  }

  if (!text) return conn.reply(m.chat, `✎ Ingresa un texto para buscar en Pinterest\n\nEjemplo:\n${usedPrefix + command} anime aesthetic`, m);

  try {
    const res = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${encodeURIComponent(text)}`);
    const data = res.data?.data;

    if (!data || !data.length) return conn.reply(m.chat, `❌ No se encontraron resultados para *${text}*`, m);

    pinterestCache[user] = {
      results: data,
      index: 0,
      query: text
    };

    return sendPinterest(conn, m, user, pinterestCache[user]);

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '❌ Ocurrió un error al buscar en Pinterest.', m);
  }
};

async function sendPinterest(conn, m, user, cache) {
  const item = cache.results[cache.index];
  if (!item) return conn.reply(m.chat, '❌ No hay más imágenes.', m);

  let caption = `🎴 *${item.title || 'Sin título'}*\n` +
                `👤 *${item.full_name}* (@${item.username})\n` +
                `📅 *${item.created}*\n` +
                `👍 *${item.likes} Likes* | 👥 *${item.followers} Followers*\n` +
                `🔗 https://pinterest.com/pin/${item.id}\n\n` +
                `📝 ${item.description || 'Sin descripción'}`;

  // Avanza al siguiente índice
  cache.index = (cache.index + 1) % cache.results.length;

  await conn.sendMessage(m.chat, {
    image: { url: item.hd },
    caption,
    buttons: [
      {
        buttonId: `${m.prefix}${m.command} SIGUIENTE_PINTEREST`,
        buttonText: { displayText: '🔁 Siguiente' },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m });
}

handler.help = ['pinterest <texto>'];
handler.tags = ['search', 'image'];
handler.command = ['pinterest', 'pin'];

export default handler;
