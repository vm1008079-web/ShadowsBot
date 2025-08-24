// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

const simpleHandler = async (m, { conn, usedPrefix }) => {
    const caption = `⚜️ Este es un mensaje con botones`;

    const buttons = [
        {
            buttonId: `${usedPrefix}opcion1`,
            buttonText: { displayText: "✅ Opción 1" },
            type: 1
        },
        {
            buttonId: `${usedPrefix}opcion2`,
            buttonText: { displayText: "❌ Opción 2" },
            type: 1
        },
        {
            buttonId: `${usedPrefix}menu`,
            buttonText: { displayText: "🔄 Menu" },
            type: 1
        }
    ];

    await conn.sendMessage(
        m.chat,
        {
            text: caption,
            buttons: buttons,
            viewOnce: true
        },
        { quoted: m }
    );
};

simpleHandler.command = /^(tes3)$/i;

export default simpleHandler;




