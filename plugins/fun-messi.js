import axios from "axios";

const MESSI_JSON_URL = `https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/Messi.json`;

let handler = async (m, { conn, text, command }) => {
    // Si NO es el comando .messi y NO es un "siguiente", no hacemos nada
    if (!/^messi$/i.test(command) && !(m.quoted && /Messi/i.test(m.quoted.text || '') && /siguiente/i.test(text))) {
        return;
    }

    let res = (await axios.get(MESSI_JSON_URL)).data;
    let url = res[Math.floor(Math.random() * res.length)];

    await conn.sendMessage(
        m.chat,
        {
            image: { url },
            caption: "*Messi*\n\n📸 Responde con *Siguiente* para ver otra",
            viewOnce: true
        },
        { quoted: m }
    );
};

handler.help = ['messi'];
handler.tags = ['fun'];
handler.command = /^messi$/i;

export default handler;