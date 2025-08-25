let handler = async (m, { conn }) => {
  // fkontak fake
  const fkontak = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: m.chat
    },
    message: {
      contactMessage: {
        displayName: '~MichiWaBot',
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:~MichiWaBot
TEL;type=CELL;type=VOICE;waid=1234567890:+51 123 456 789
END:VCARD`,
        jpegThumbnail: null // si quieres, aquí puedes poner imagen en base64
      }
    }
  }

  // enviar mensaje con texto y citado del fkontak
  await conn.sendMessage(m.chat, { text: 'Hola', mentions: [m.sender] }, { quoted: fkontak })
}

// comando para ejecutarlo
handler.command = /^tes5$/i

export default handler