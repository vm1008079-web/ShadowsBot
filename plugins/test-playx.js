//--> Creado por Ado (github.com/Ado-rgb)

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Nombre del bot dinámico
    let nombreBot = global.namebot || '✨ MI BOT KAWAII ✨'

    // Fkontak dinámico
    let fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: nombreBot,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Bot;;;\nFN:${nombreBot}\nTEL;type=CELL;type=VOICE;waid=50493732693:+504 93732693\nEND:VCARD`,
          jpegThumbnail: null
        }
      }
    }

    // Lista de opciones
    const sections = [
      {
        title: "🎮 Juegos",
        rows: [
          { title: "🎲 Piedra, Papel o Tijera", rowId: `${usedPrefix}ppt` },
          { title: "🎯 Adivina el número", rowId: `${usedPrefix}adivina` }
        ]
      },
      {
        title: "🎵 Música",
        rows: [
          { title: "🎧 Reproducir música", rowId: `${usedPrefix}play` },
          { title: "🎶 Descargar audio", rowId: `${usedPrefix}ytmp3` }
        ]
      },
      {
        title: "🛠️ Herramientas",
        rows: [
          { title: "📌 Generar cita", rowId: `${usedPrefix}quozio` },
          { title: "🔍 Buscar info", rowId: `${usedPrefix}buscar` }
        ]
      }
    ]

    // Mensaje de lista
    const listMessage = {
      text: `🌸 ¡Hola! Soy ${nombreBot} 🌸\n\nElige una opción del menú:`,
      buttonText: "Abrir menú 📜",
      sections,
      mentions: [m.sender]
      // NO se incluye footer
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: fkontak })
  } catch (e) {
    console.error(e)
    m.reply("❌ Ocurrió un error mostrando el menú.")
  }
}


handler.command = ["listamenu"]

export default handler