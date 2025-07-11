const cleanId = (id = '') => id.replace(/\D/g, '');

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const owner = groupMetadata.owner || '';

  const senderNumber = cleanId(m.sender);
  let senderRole = 'normal'; // rol por defecto

  // Recorremos la lista de participantes y validamos su rol exactamente igual que como se imprime
  console.log('\n👥 Participantes del grupo:');
  for (const p of participants) {
    const number = cleanId(p.id);
    let rol = 'normal';

    if (p.admin === 'admin') rol = 'admin';
    else if (p.admin === 'superadmin') rol = 'superadmin';
    else if (cleanId(owner) === number) rol = 'owner';

    console.log(`• ${p.id} → ${number} → rol: ${rol}`);

    // Detectamos si este participante es el que mandó el mensaje
    if (number === senderNumber) senderRole = rol;
  }

  console.log(`\n📨 Tu número: ${senderNumber}`);
  console.log(`🧠 Tu rol detectado: ${senderRole}`);

  const isUserAdmin = senderRole === 'admin' || senderRole === 'superadmin' || senderRole === 'owner';
  console.log(`✅ ¿Es admin el que mandó el comando? ${isUserAdmin}\n`);

  if (!isUserAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

  // 🎯 Aquí ya sos admin, seguimos con la función
  const mainEmoji = global.db.data.chats[m.chat]?.customEmoji || '☕';
  const decoEmoji1 = '✨';
  const decoEmoji2 = '📢';

  m.react(mainEmoji);

  const mensaje = args.join(' ') || '¡Atención a todos!';
  const total = participants.length;

  const encabezado = 
`${decoEmoji2} *Mención general activada* ${decoEmoji2}

> 💬 Mensaje: *${mensaje}*
> 👥 Total de miembros: *${total}*
`;

  const cuerpo = participants.map(p => `> ${mainEmoji} @${cleanId(p.id)}`).join('\n');
  const pie = `\n${decoEmoji1} Comando ejecutado: *${usedPrefix + command}*`;

  const textoFinal = `${encabezado}\n${cuerpo}\n${pie}`;

  await conn.sendMessage(m.chat, {
    text: textoFinal.trim(),
    mentions: participants.map(p => p.id)
  });
};

handler.help = ['invocar *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;
handler.register = true;

export default handler;