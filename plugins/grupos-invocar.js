// 🔧 Función que limpia el ID (solo deja el número)
const cleanId = (id = '') => id.replace(/\D/g, ''); // quita todo excepto números

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];
  const owner = groupMetadata.owner || '';

  const senderNumber = cleanId(m.sender);
  const ownerNumber = cleanId(owner);

  // Lista de admins limpios
  const groupAdmins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => cleanId(p.id));

  if (ownerNumber && !groupAdmins.includes(ownerNumber)) groupAdmins.push(ownerNumber);

  // DEBUG
  console.log('\n=== Participantes ===');
  for (let p of participants) {
    const num = cleanId(p.id);
    const role = p.admin ? `🛡️ ${p.admin}` : (num === ownerNumber ? '👑 Owner' : '👤 Normal');
    console.log(`→ ${p.id} → ${num} → ${role}`);
  }

  console.log('\n📌 Sender:', m.sender, '→', senderNumber);
  console.log('🛡️ Admins:', groupAdmins);

  const isUserAdmin = groupAdmins.includes(senderNumber);
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