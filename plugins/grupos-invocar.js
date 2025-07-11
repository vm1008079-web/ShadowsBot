const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Solo en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const ownerId = groupMetadata.owner || '';

  // Función para encontrar participante por número ignorando sufijo
  const findParticipantByNumber = (participants, number) =>
    participants.find(p => p.id.startsWith(number));

  const senderNum = m.sender.split('@')[0];
  const userParticipant = findParticipantByNumber(participants, senderNum);

  if (!userParticipant) return m.reply('❌ No estás en la lista de participantes, no puedo validar admin.');

  const senderRole = userParticipant.admin || (m.sender === ownerId ? 'owner' : 'normal');
  const isUserAdmin = senderRole === 'admin' || senderRole === 'superadmin' || senderRole === 'owner';

  if (!isUserAdmin) return m.reply('❌ Solo administradores pueden usar este comando.');

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

  const cuerpo = participants.map(p => `> ${mainEmoji} @${p.id.split('@')[0]}`).join('\n');
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

export default handler;onst handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Solo en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const ownerId = groupMetadata.owner || '';

  console.log('=== PARTICIPANTES ===');
  for (const p of participants) {
    console.log(`ID: ${p.id} | Admin: ${p.admin || 'normal'}`);
  }

  console.log(`Owner ID: ${ownerId}`);
  console.log(`m.sender: ${m.sender}`);

  // Luego intento detectar admin con la comparación normal y con número limpio
  const cleanId = (id = '') => id.replace(/\D/g, '');

  const senderNumber = cleanId(m.sender);
  const ownerNumber = cleanId(ownerId);

  const isAdminByCleanId = participants.some(p => (p.admin === 'admin' || p.admin === 'superadmin') && cleanId(p.id) === senderNumber);
  const isOwnerByCleanId = senderNumber === ownerNumber;

  const isAdminByExactId = participants.some(p => (p.admin === 'admin' || p.admin === 'superadmin') && p.id === m.sender);
  const isOwnerByExactId = ownerId === m.sender;

  console.log('¿Admin detectado por número limpio?', isAdminByCleanId);
  console.log('¿Owner detectado por número limpio?', isOwnerByCleanId);
  console.log('¿Admin detectado por ID exacto?', isAdminByExactId);
  console.log('¿Owner detectado por ID exacto?', isOwnerByExactId);

  if (!(isAdminByCleanId || isOwnerByCleanId || isAdminByExactId || isOwnerByExactId)) {
    return m.reply('❌ Solo admins');
  }

  // Aquí sigue el código para enviar la mención si es admin o owner...

  m.reply('✅ Sos admin o dueño, comando aceptado.');
};

handler.command = ['invocar'];
handler.group = true;

export default handler;