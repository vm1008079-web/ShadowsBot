const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  const owner = groupMetadata.owner; // el dueño del grupo

  // Buscar participante que hizo el mensaje
  const userParticipant = participants.find(p => p.id === m.sender);

  // Definir función para checar si es admin o dueño
  const esAdmin = () => {
    if (!userParticipant) return false; // si no está en la lista, no es admin
    if (m.sender === owner) return true; // es dueño, seguro admin
    // admin puede venir como 'admin' o 'superadmin' o 'owner' según la librería
    const adminStatus = userParticipant.admin;
    return adminStatus === 'admin' || adminStatus === 'superadmin' || adminStatus === 'owner';
  };

  const isUserAdmin = esAdmin();

  console.log(`El usuario ${m.sender} es admin? ${isUserAdmin}`);

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

  let cuerpo = participants.map(p => `> ${mainEmoji} @${p.id.split('@')[0]}`).join('\n');

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