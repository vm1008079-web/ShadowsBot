// >>⟩ Creado por GianPoolS < github.com/GianPoolS >
// >>⟩ no quites los creditos

let handler = async (m, { conn }) => {
  try {
    let img = 'https://raw.githubusercontent.com/AdonixServices/Files/main/1754310580366-xco6p1-1754310544013-6cc3a6.jpg'

    let text = `
┏━━━❰ ✨ Datos del Usuario ✨ ❱━━━┓
┃ 👤 Nombre: *${m.pushName}*
┃ 📊 Nivel: *27*
┃ ⚡ XP Total: *4623*
┃ 👑 Rol: *Creador*
┗━━━━━━━━━━━━━━━━┛

┏━━━❰ ⏰ Información de Fecha ❱━━━┓
┃ 🕒 Hora: *${new Date().toLocaleTimeString('es-PE')}*
┃ 📅 Fecha: *${new Date().toLocaleDateString('es-PE')}*
┃ 📌 Día: *${new Date().toLocaleDateString('es-PE', { weekday: 'long' })}*
┗━━━━━━━━━━━━━━━━┛
`

    let fkontak = {
      key: { 
        fromMe: false, 
        participant: '0@s.whatsapp.net', 
        remoteJid: 'status@broadcast' 
      },
      message: {
        contactMessage: {
          displayName: `${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${m.pushName}\nFN:${m.pushName}\nTEL;type=CELL;type=VOICE;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nEND:VCARD`
        }
      }
    }

    // ListMessage con prefijo ".menú" en los títulos
    const listMessage = {
      text,
      footer: '✦ MichiWa (BETA) ✦',
      title: '📋 500 Comandos disponibles',
      buttonText: '📂 ABRIR LISTA',
      sections: [
        {
          title: '🔹 Información',
          rows: [
            { title: '🧾 Datos del Usuario', rowId: '.profile', description: 'Ver tu información actual' },
            { title: '⏰ Información de Fecha', rowId: '.time', description: 'Ver hora y fecha actual' }
          ]
        },
        {
          title: '🔹 Opciones',
          rows: [
            { title: '👤 Auto Verificar', rowId: '.verificar', description: 'Verifica tu cuenta automáticamente' },
            { title: '🌹 Donar', rowId: '.donar', description: 'Apoya al bot con una donación' }
          ]
        }
      ],
      buttons: [
        { buttonId: '', buttonText: { displayText: '👤 VERIFICAR' }, type: 1 },
        { buttonId: '', buttonText: { displayText: '🌹 DONAR' }, type: 1 }
      ],
      headerType: 4,
      image: { url: img }
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: fkontak })

  } catch (e) {
    console.log(e)
    m.reply('❌ Error al mostrar el menú.')
  }
}

//handler.help = ['menu']
//handler.tags = ['main']
handler.command = /^test4$/i

export default handler
