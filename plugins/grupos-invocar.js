const cleanId = (id = '') => id.replace(/\D/g, '');

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];

  const senderNumber = cleanId(m.sender);

  // Encontrar el participante exacto que mandó el mensaje
  const userParticipant = participants.find(p => cleanId(p.id) === senderNumber);

  // Mostrar todos los participantes para debug
  console.log('\n📋 Lista de Participantes:');
  for (const p of participants) {
    const numero = cleanId(p.id);
    const rol = p.admin || (groupMetadata.owner && cleanId(groupMetadata.owner) === numero ? 'owner' : 'normal');
    console.log(`• ${p.id} → ${numero} → rol: ${rol}`);
  }

  if (!userParticipant) {
    console.log(`⚠️ No se encontró a ${m.sender} entre los participantes.`);
    return m.reply('❌ No se pudo verificar tu rol en este grupo.');
  }

  const isUserAdmin = userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin' || cleanId(groupMetadata.owner) === senderNumber;

  console.log(`📨 Sender: ${p.id} → ${senderNumber}`);
  console.log(`🔎 ¿Es admin?: ${isUserAdmin}\n`);

  if (!isUserAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

  // 👑 Procedemos si es admin
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