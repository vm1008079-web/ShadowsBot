const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Solo en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const ownerId = groupMetadata.owner || '';

  // Queremos encontrar participante que coincida EXACTO con m.sender, o el owner exacto
  let senderRole = 'normal';

  // Primero buscamos el participante con id EXACTO = m.sender
  const userParticipant = participants.find(p => p.id === m.sender);

  // Si no existe exacto, revisamos si sos owner (igual con m.sender)
  if (userParticipant) {
    if (userParticipant.admin === 'admin') senderRole = 'admin';
    else if (userParticipant.admin === 'superadmin') senderRole = 'superadmin';
  } else if (m.sender === ownerId) {
    senderRole = 'owner';
  }

  console.log(`m.sender: ${m.sender}`);
  console.log(`ownerId: ${ownerId}`);
  console.log(`Rol detectado: ${senderRole}`);

  const isUserAdmin = senderRole === 'admin' || senderRole === 'superadmin' || senderRole === 'owner';

  if (!isUserAdmin) return m.reply('❌ Solo admins.');

  // El resto sigue igual, ejemplo:

  const mainEmoji = global.db.data.chats[m.chat]?.customEmoji || '☕';
  m.react(mainEmoji);

  const mensaje = args.join(' ') || '¡Atención a todos!';
  const total = participants.length;

  const encabezado = `📢 *Mención general activada* 📢

> 💬 Mensaje: *${mensaje}*
> 👥 Total de miembros: *${total}*`;

  const cuerpo = participants.map(p => `> ${mainEmoji} @${p.id.split('@')[0]}`).join('\n');
  const pie = `\n✨ Comando ejecutado: *${usedPrefix + command}*`;

  const textoFinal = `${encabezado}\n${cuerpo}\n${pie}`;

  await conn.sendMessage(m.chat, {
    text: textoFinal.trim(),
    mentions: participants.map(p => p.id)
  });
};

handler.help = ['invocar'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall'];
handler.group = true;
handler.register = true;

export default handler;