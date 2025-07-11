const cleanId = (id) => id.split('@')[0];

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  const owner = groupMetadata.owner;

  // Mostrar todos los participantes y roles (solo para debug)
  console.log('=== Lista de participantes y su rol ===');
  participants.forEach(p => {
    const rol = (cleanId(p.id) === cleanId(owner)) ? 'owner' : (p.admin ? p.admin : 'miembro normal');
    console.log(`Usuario: ${p.id} - Rol: ${rol}`);
  });
  console.log('====================================');

  // Buscar participante con id limpio
  const userParticipant = participants.find(p => cleanId(p.id) === cleanId(m.sender));

  console.log('=== Info completa del participante que envió el mensaje ===');
  console.log(JSON.stringify(userParticipant, null, 2)); // Imprime todo el objeto en consola
  console.log('===========================================================');

  // Ahora chequeamos admin basado en lo que encontremos
  const isUserAdmin = (() => {
    if (!userParticipant) return false;
    if (cleanId(m.sender) === cleanId(owner)) return true;
    // Por si acaso admin viene con mayúsculas o distinto
    const adminStatus = (userParticipant.admin || '').toLowerCase();
    return adminStatus === 'admin' || adminStatus === 'superadmin' || adminStatus === 'owner';
  })();

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