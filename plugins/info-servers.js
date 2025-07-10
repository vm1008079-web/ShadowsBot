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
╭━━━〔 🌿 *SYA Survivals* - Servidores activos 〕━━━⬣

👋 ¡Hola aventurero! Bienvenido a *SYA Survivals*,  
una comunidad humilde, activa y llena de buena vibra 🍃  
Aquí podés entrar a jugar *Survival* desde tu cel o tu PC.  
¡Mirá los servidores disponibles y unite cuando querás! 🧱💚

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣

📱 *Servidor 1 - MultiCraft (Android)*  
┌🟢 Plataforma: MultiCraft Build & Mine  
├📥 Descargar:  
│ https://play.google.com/store/apps/details?id=com.multicraft.game  
├🎮 Modo: Survival  
├🧩 Código de invitación: *Z8TY2ANB*  
└⏰ Estado: Disponible 24/7  
✨ Ideal pa jugar desde el cel con los compitas y construir tranquilo 🏡

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣

💻 *Servidor 2 - Minecraft Java (PC)*  
┌🔸 Versión recomendada: *1.8.8*  
├🌐 IP: *207.180.254.11:12005*  
├🎮 Modo: Survival  
└⏰ Estado: En línea siempre  
✨ Pa los que juegan en PC y quieren full experiencia pura 🗺️⚔️

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣

🤝 Ambos servidores están activos 24/7  
🌱 Sin toxicidad, con gente buena onda y muchas aventuras.  
💌 Unite y viví la experiencia *SYA TEAM* 🐾

#SYASurvivals #MultiCraft #MinecraftJava
`.trim()

  await conn.sendMessage(m.chat, { text: info }, rcanal)
}

handler.command = ['servers']
export default handler
