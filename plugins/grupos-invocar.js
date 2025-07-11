const cleanId = (id = '') => id.replace(/\D/g, '');

const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se puede usar en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants || [];

  const senderNumber = cleanId(m.sender);
  const ownerNumber = cleanId(groupMetadata.owner || '');

  console.log('\n📋 Lista de participantes del grupo (comparables con m.sender):\n');

  for (const p of participants) {
    const userNumber = cleanId(p.id);
    let rol = 'normal';

    if (p.admin === 'admin') rol = 'admin';
    if (p.admin === 'superadmin') rol = 'superadmin';
    if (userNumber === ownerNumber) rol = 'owner';

    const esElMismo = userNumber === senderNumber;

    console.log(`• Número: ${userNumber} → Rol: ${rol}${esElMismo ? ' ← MANDÓ EL COMANDO' : ''}`);
  }

  console.log(`\n📨 m.sender: ${m.sender}`);
  console.log(`✅ Número limpio de quien mandó el comando: ${senderNumber}`);
};

handler.command = ['verroles'];
handler.group = true;

export default handler;