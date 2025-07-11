import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`❌ Escribe un texto\n*Ejemplo:* ${usedPrefix + command} Hola que pex soy un loquendo xd`);

  try {
    m.react('🎙️');
    m.reply('🎧 *Generando tu voz Loquendo...*\nEspera un momento 👀');

    const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/loquendo?text=${encodeURIComponent(text)}&voice=juan`);
    const json = await res.json();

    if (!json.audio) throw `❌ Error: No se recibió audio`;

    const audioBuffer = Buffer.from(json.audio, 'base64');

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: true // si lo querés como nota de voz
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error generando el TTS Loquendo');
  }
};

handler.help = ['tts <texto>'];
handler.tags = ['voz'];
handler.command = /^tts$/i;
handler.register = true
export default handler;
