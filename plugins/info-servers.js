let handler = async (m, { conn, command }) => {
  let info = `
🌿 SYA Survivals - Servidores disponibles

> Hola! Bienvenido a SYA Survivals, una comunidad humilde pero llena de aventuras donde podés entrar a jugar Survival ya sea desde tu celular o PC.
Aquí te dejamos toda la info pa que te unas cuando querrás 🙌

────────────────────

📱 Servidor 1 - MultiCraft (Android)

> 🟢 Plataforma: MultiCraft Build & Mine  
📥 Descarga desde la Play Store:  
https://play.google.com/store/apps/details?id=com.multicraft.game  
🎮 Modo: Survival  
🧩 Código de invitación: Z8TY2ANB  
⏰ Estado: Disponible 24/7  
🤝 Ideal pa jugar desde el cel con tus compas y construir en paz 🏡  

────────────────────

💻 Servidor 2 - Minecraft Java (PC)

> 🔸 Versión recomendada: 1.8.8  
🌐 IP del servidor: 207.180.254.11:12005  
🎮 Modo: Survival  
⏰ Estado: En línea siempre  
🧱 Perfecto pa los que juegan en compu y les gusta el survival puro 🗺️  

────────────────────

> Ambos servidores están activos, con buena onda, sin toxicidad y abiertos a todos los que quieran jugar tranquilamente 💚  
Animate y venite a vivir la experiencia SYA 🐾  

#SYASurvivals #MultiCraft #MinecraftJava
`.trim()

  await conn.sendMessage(m.chat, { text: info }, { quoted: rcanal }) // usando tu variable global
}

handler.command = ['servers']
export default handler
