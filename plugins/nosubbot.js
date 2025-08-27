// * Código creado por OMEGAPHANTOM, no quites créditos *//

let handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
    if (!isOwner) return m.reply('❌ Este comando solo puede ser usado por el owner del bot.');

    // Verificar el estado actual
    global.nosubbot = global.nosubbot || { status: false };
    
    if (!args[0]) {
        // Mostrar estado actual
        return m.reply(`🔧 *Estado de nosubbot:* ${global.nosubbot.status ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}\n\n• Los comandos *code* y *qr* están ${global.nosubbot.status ? 'bloqueados 🔒' : 'disponibles 🔓'}\n\nUsa: *${usedPrefix}nosubbot on* para activar\nUsa: *${usedPrefix}nosubbot off* para desactivar`);
    }

    const action = args[0].toLowerCase();
    
    if (action === 'on') {
        if (global.nosubbot.status) {
            return m.reply('❌ El bloqueo de comandos sub-bot ya está activado.');
        }
        global.nosubbot.status = true;
        m.reply('✅ *Bloqueo activado*\n\n• Los comandos *code* y *qr* han sido deshabilitados globalmente.\n• Nadie podrá usar estos comandos hasta que se desactive el bloqueo.');
        
    } else if (action === 'off') {
        if (!global.nosubbot.status) {
            return m.reply('❌ El bloqueo de comandos sub-bot ya está desactivado.');
        }
        global.nosubbot.status = false;
        m.reply('✅ *Bloqueo desactivado*\n\n• Los comandos *code* y *qr* han sido habilitados nuevamente.\n• Los usuarios pueden usar estos comandos normalmente.');
        
    } else {
        m.reply('❌ Opción no válida. Usa: *on* o *off*\n\nEjemplo: *' + usedPrefix + 'nosubbot on*');
    }
}

handler.help = ['nosubbot <on/off>'];
handler.tags = ['owner'];
handler.command = ['nosubbot'];
handler.owner = true;

export default handler;
