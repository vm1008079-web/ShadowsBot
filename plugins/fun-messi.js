import axios from "axios";

const MESSI_JSON_URL = `https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/Messi.json`;

let handler = async (m, { conn, text, command }) => {
    let res = (await axios.get(MESSI_JSON_URL)).data;
    let url = res[Math.floor(Math.random() * res.length)];

    // Detectar si responde a una imagen del bot con "siguiente"
    if (m.quoted && m.quoted.message && /Messi/i.test(m.quoted.text || '') && /siguiente/i.test(m.text)) {
        await conn.sendMessage(
            m.chat,
            {
                image: { url },
                caption: "*Messi*\n\n📸 Responde con *Siguiente* para ver otra",
                viewOnce: true
            },
            { quoted: m }
        );
        return;
    }

    // Comando inicial .messi
    if (command === 'messi') {
        await conn.sendMessage(
            m.chat,
            {
                image: { url },
                caption: "*Messi*\n\n📸 Responde con *Siguiente* para ver otra",
                viewOnce: true
            },
            { quoted: m }
        );
    }
};

handler.help = ['messi'];
handler.tags = ['fun'];
handler.customPrefix = /^siguiente$/i; // Detecta si el texto es "siguiente"
handler.command = /^messi$/i;

export default handler;