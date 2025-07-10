let handler = async (m, { conn, command }) => {
  const rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 200,
      forwardedNewsletterMessageInfo: {
        newsletterJid: global.idcanal,
        serverMessageId: 100,
        newsletterName: global.namecanal,
      }
    }
  }

  let info = `
「🌿」✧─── ･ ｡ﾟ★: *.✦ .* :★. ───✧
➤ 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 *SYA SURVIVALS*
✦↷ ᴊᴜᴇɢᴀ ʏ ᴄᴏɴsᴛʀᴜɪʀ ᴀʟ ᴍᴀxɪᴍᴏ
✧─── ･ ｡ﾟ★: *.✦ .* :★. ───✧

➤ Servidor 1 - MultiCraft
┆🌐 Plataforma: MultiCraft Build & Mine
┆⬇️ Descargar:
┆  play.google.com/store/apps/details?id=com.multicraft.game
┆🎮 Modo: Survival
┆🔑 Código: *Z8TY2ANB*
┆⏰ Estado: 🟢 24/7 ON

➤ Servidor 2 - Minecraft Java
┆⚙️ Versión: *1.8.8*
┆🌍 IP: *207.180.254.11:12005*
┆🎮 Modo: Survival
┆⏰ Estado: 🟢 Siempre ONLINE

✧─── ･ ｡ﾟ★: *.✦ .* :★. ───✧
➤ Comunidad sin tóxicos y con buena onda
➤ Únete al *SYA TEAM* 🐾
「🌿」✧─── ･ ｡ﾟ★: *.✦ .* :★. ───✧
`.trim()

  await conn.sendMessage(m.chat, { text: info }, rcanal)
}

handler.command = ['servers']
export default handler
