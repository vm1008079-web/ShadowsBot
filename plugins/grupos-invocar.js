const handler = async (m, { conn, args, command, usedPrefix }) => {
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