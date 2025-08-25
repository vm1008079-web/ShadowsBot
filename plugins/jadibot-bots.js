import { readdirSync, statSync, unlinkSync, existsSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path from 'path';
import ws from 'ws';

let handler = async (m, { conn, command, usedPrefix, args, text, isOwner }) => {
  const isCommandDelete = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
  const isCommandStop = /^(stop|pausarai|pausarbot)$/i.test(command);
  const isCommandList = /^(bots|sockets|socket)$/i.test(command);

  async function reportError(e) {
    await conn.sendMessage(m.chat, { text: `❌ Ocurrió un error inesperado, contacte con el creador.`, ...global.rcanal }, { quoted: m });
    console.error(e);
  }

  switch (true) {
    case isCommandDelete: {
      let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
      let uniqid = `${who.split`@`[0]}`;
      const sessionPath = path.join(process.cwd(), `${jadi}`, uniqid);

      if (!fs.existsSync(sessionPath)) {
        await conn.sendMessage(
          m.chat,
          {
            text: `⚠️ No tienes sesión activa.\n\nPuedes crear una usando:\n*${usedPrefix + command}*\n\nO usar tu ID para saltarte este paso:\n*${usedPrefix + command}* \`${uniqid}\``,
            ...global.rcanal
          },
          { quoted: m }
        );
        return;
      }

      if (global.conn.user.jid !== conn.user.jid) {
        return conn.sendMessage(
          m.chat,
          {
            text: `⚠️ Este comando debe ejecutarse desde el *Bot Principal*.\n\n[Contactar Principal](https://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0)`,
            ...global.rcanal
          },
          { quoted: m }
        );
      }

      try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        await conn.sendMessage(
          m.chat,
          { text: `✅ Tu sesión como Sub-Bot ha sido eliminada correctamente y se borró todo rastro.`, ...global.rcanal },
          { quoted: m }
        );
      } catch (e) {
        reportError(e);
      }
    } break;

    case isCommandStop: {
      if (global.conn.user.jid === conn.user.jid) {
        await conn.sendMessage(
          m.chat,
          { text: `⚠️ Si no eres un Sub-Bot, contacta al número principal para activarte.`, ...global.rcanal },
          { quoted: m }
        );
      } else {
        await conn.sendMessage(
          m.chat,
          { text: `🛑 ${botname || 'Sub-Bot'} desactivada correctamente.`, ...global.rcanal },
          { quoted: m }
        );
        conn.ws.close();
      }
    } break;

    case isCommandList: {
      const users = [...new Set([...global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)])];

      function msToTime(ms) {
        let segundos = Math.floor(ms / 1000);
        let minutos = Math.floor(segundos / 60);
        let horas = Math.floor(minutos / 60);
        let dias = Math.floor(horas / 24);
        segundos %= 60;
        minutos %= 60;
        horas %= 24;
        return `${dias ? dias + " días, " : ""}${horas ? horas + " horas, " : ""}${minutos ? minutos + " minutos, " : ""}${segundos ? segundos + " segundos" : ""}`;
      }

      const message = users
        .map((v, i) => `• 「 ${i + 1} 」\n🧃 Usuario: ${v.user.name || 'Sub-Bot'}\n💎 https://wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado\n🕑 Tiempo activo: ${v.uptime ? msToTime(Date.now() - v.uptime) : 'Desconocido'}`)
        .join('\n\n\n\n');

      const replyMessage = message.length ? message : `❌ No hay Sub-Bots disponibles en este momento.`;

      const responseMessage = `🌟 *LISTA DE SUB-BOTS ACTIVOS* 🌟\n\n💡 Puedes solicitar permiso para unir un bot a tu grupo.\n\n*Sub-Bots conectados:* ${users.length || '0'}\n\n${replyMessage.trim()}`;

      await conn.sendMessage(m.chat, { text: responseMessage, mentions: conn.parseMention(responseMessage), ...global.rcanal }, { quoted: m });
    } break;
  }
};

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = ['deletesesion', 'deletebot', 'deletesession', 'stop', 'pausarai', 'pausarbot', 'bots', 'sockets', 'socket'];

export default handler;