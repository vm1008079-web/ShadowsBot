import axios from "axios";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return conn.sendMessage(
            m.chat,
            { text: `❌ ¿Qué quieres preguntar?\n\nEjemplo: ${usedPrefix + command}` },
            { quoted: m }
        );
    }

    try {
        await m.react('💬');

        let d = new Date(new Date() + 3600000);
        let locale = 'en';
        const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        let day = d.toLocaleDateString(locale, { weekday: 'long' });
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

        let logic = `Tu nombre es ChatGPT, creado y desarrollado por Ado. Usa lenguaje casual como 'yo' y 'tú'. Eres inteligente y resuelves cualquier problema. Siempre usa emojis apropiados. Fecha: ${date}, Hora: ${time}, Día: ${day}.`;

        let json = await openai(text, logic);

        let fkontak = { 
            "key": { "fromMe": false, "participant": "0@s.whatsapp.net", "remoteJid": "0@s.whatsapp.net" }, 
            "message": { "contactMessage": { "displayName": "🍿 GPT 4", "vcard": "BEGIN:VCARD\nVERSION:3.0\nFN:GPT 4\nTEL;type=CELL;type=VOICE;waid=0:0\nEND:VCARD" } } 
        };

        await conn.sendMessage(
            m.chat,
            { text: `\`🌤️ ChatGPT4\`\n\n> ${json}` },
            { quoted: fkontak }
        );

        await m.react('🔥');
    } catch (e) {
        await m.react('❎');
    }
};

handler.help = ["chatgpt"];
handler.tags = ["ia"];
handler.command = /^(chatgpt)$/i;

export default handler;

async function openai(text, logic) {
    let response = await axios.post("https://chateverywhere.app/api/chat/", {
        model: {
            id: "gpt-4",
            name: "GPT-4",
            maxLength: 32000,
            tokenLimit: 8000,
            completionTokenLimit: 5000,
            deploymentName: "gpt-4"
        },
        messages: [
            { pluginId: null, content: text, role: "user" }
        ],
        prompt: logic,
        temperature: 0.5
    }, {
        headers: {
            "Accept": "/*/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
    });

    return response.data;
}
