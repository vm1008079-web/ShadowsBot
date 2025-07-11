const cleanId = (id = '') => id.replace(/\D/g, ''); // solo deja el número

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];

  const senderNumber = cleanId(m.sender);

  // Creamos lista de admins como números planos
  const adminNumbers = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => cleanId(p.id));

  // Agregamos también al owner si existe
  if (groupMetadata.owner) {
    const ownerNumber = cleanId(groupMetadata.owner);
    if (!adminNumbers.includes(ownerNumber)) adminNumbers.push(ownerNumber);
  }

  // DEBUG
  console.log('\n👥 Participantes del grupo:');
  for (const p of participants) {
    console.log(`• ${p.id} → rol: ${p.admin || 'normal'} → número: ${cleanId(p.id)}`);
  }

  console.log('\n📨 Sender:', m.sender, '→', senderNumber);
  console.log('🛡️ Números admins:', adminNumbers);
  const isUserAdmin = adminNumbers.includes(senderNumber);
  console.log(`✅ ¿Es admin el que mandó el comando? ${isUserAdmin}\n`);

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