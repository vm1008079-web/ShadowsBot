const cleanId = (id = '') => id.replace(/\D/g, '');

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const ownerNumber = cleanId(groupMetadata.owner || '');

  const senderNumber = cleanId(m.sender);
  let senderRole = 'normal';

  // Buscamos al participante que envió el comando
  const userParticipant = participants.find(p => cleanId(p.id) === senderNumber);

  if (userParticipant) {
    if (userParticipant.admin === 'admin') senderRole = 'admin';
    else if (userParticipant.admin === 'superadmin') senderRole = 'superadmin';
    else if (senderNumber === ownerNumber) senderRole = 'owner';
  }

  console.log(`📨 Número del que envió el comando: ${senderNumber}`);
  console.log(`🔎 Rol detectado: ${senderRole}`);

  const isUserAdmin = senderRole === 'admin' || senderRole === 'superadmin' || senderRole === 'owner';

  if (!isUserAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

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