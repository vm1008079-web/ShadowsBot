let handler = async (m, { conn }) => {
    try {
        // Validamos si el usuario respondió a un mensaje
        if (!m.quoted) return m.reply('*Responde a un mensaje para eliminarlo wey*');

        // Obtenemos el ID del mensaje a eliminar
        let msgId = m.quoted.key;

        // Eliminamos el mensaje
        await conn.sendMessage(m.chat, { delete: msgId });
        
        // Mensaje de confirmación opcional
        m.reply('*Mensaje eliminado 🔥*');

    } catch (e) {
        console.log(e);
        m.reply('*No pude eliminar el mensaje wey 😢*');
    }
};

handler.command = ['del']; // Comando que activa el plugin
handler.admin = true;
handler.group = true; 

export default handler;
