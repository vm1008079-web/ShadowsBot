// >>⟩ Creado por GianPoolS < github.com/GianPoolS >
// >>⟩ no quites los creditos

// >>⟩ Creado por GianPoolS < github.com/GianPoolS >
// >>⟩ no quites los creditos

let handler = async (m, { conn }) => {
  try {
    const carousel = {
      carouselMessage: {
        cards: [
          {
            header: {
              title: "✨ Primera diapositiva",
              subtitle: "Imagen 1 con botones",
              hasMediaAttachment: true,
              imageMessage: await conn.prepareMessageMedia(
                { url: "https://telegra.ph/file/12a9f7b6f8bfb16c74f77.jpg" },
                "imageMessage"
              )
            },
            body: { text: "📌 Esta es la primera tarjeta del carrusel" },
            nativeFlowMessage: {
              buttons: [
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🌐 GitHub", url: "https://github.com/GianPoolS" }) },
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "📺 YouTube", url: "https://youtube.com" }) },
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "💬 WhatsApp", url: "https://wa.me/51987654321" }) }
              ]
            }
          },
          {
            header: {
              title: "🚀 Segunda diapositiva",
              subtitle: "Imagen 2 con botones",
              hasMediaAttachment: true,
              imageMessage: await conn.prepareMessageMedia(
                { url: "https://telegra.ph/file/7f6c1f0d68f148cd07e4a.jpg" },
                "imageMessage"
              )
            },
            body: { text: "✅ Esta es la segunda tarjeta del carrusel" },
            nativeFlowMessage: {
              buttons: [
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🌐 GitHub", url: "https://github.com/GianPoolS" }) },
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "📺 YouTube", url: "https://youtube.com" }) },
                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "💬 WhatsApp", url: "https://wa.me/51987654321" }) }
              ]
            }
          }
        ]
      }
    }

    await conn.sendMessage(m.chat, carousel, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply("❌ Error al enviar el carrusel (story ads).")
  }
}

handler.command = /^test3$/i
export default handler


/*let handler = async (m, { conn }) => {
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

export default handler*/
