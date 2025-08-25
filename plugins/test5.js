let handler = async (m, { conn }) => {
  // fake mensaje citado de texto
  const ftext = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: m.chat
    },
    message: {
      conversation: '~MichiBot'
    }
  }

  // enviar mensaje con texto y citado del fake texto
  await conn.sendMessage(m.chat, { text: 'Hola', mentions: [m.sender] }, { quoted: ftext })
}

// comando para ejecutarlo
handler.command = /^tes5$/i

export default handler