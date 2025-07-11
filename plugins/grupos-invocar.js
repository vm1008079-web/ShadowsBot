const cleanId = (id) => id.split('@')[0];

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  const owner = groupMetadata.owner;

  const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
  if (owner) groupAdmins.push(owner); // Aseguramos que el owner esté en la lista de admins

  // DEBUG: Mostrar todos los admins
  console.log('=== Lista de administradores ===');
  groupAdmins.forEach(id => console.log('Admin:', id));
  console.log('===============================');

  // Ver si el que mandó el comando es admin
  const isUserAdmin = groupAdmins.includes(m.sender);

  console.log(`¿El usuario que mandó el comando (${m.sender}) es admin? ${isUserAdmin}`);

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

  let cuerpo = participants.map(p => `> ${mainEmoji} @${cleanId(p.id)}`).join('\n');

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