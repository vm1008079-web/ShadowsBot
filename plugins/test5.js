import fetch from 'node-fetch';
import sharp from 'sharp';
import moment from 'moment-timezone';
import { promises as fs } from 'fs';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg;
import { xpRange } from '../lib/levelling.js';

let handler = async (m, { conn, usedPrefix }) => {
  m.react('🐢');
  let name = await conn.getName(m.sender);
  if (!global.menutext) await global.menu();

  let cap = global.menutext;
  let user = global.db.data.users[m.sender];
  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length;
  let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
  let _package = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url)).catch(_ => ({})) || {});
  let { exp, limit, level, role } = global.db.data.users[m.sender];
  let { min, xp, max } = xpRange(level, global.multiplier);
  let totalexp = user.totalexp || 0;
  let prem = user.premium ? '✅' : '✖️';
  let version = _package.version;
  let time = moment.tz('America/Lima').format('HH:mm:ss');
  let date = moment.tz('America/Lima').format('DD/MM/YYYY');
  let week = moment.tz('America/Lima').format('dddd');
  uptime = process.uptime();
  uptime = `${Math.floor(uptime / 86400)}d ${Math.floor(uptime % 86400 / 3600)}h ${Math.floor(uptime % 3600 / 60)}m ${Math.floor(uptime % 60)}s`;
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length;
  
  let txt = `╭┈ ↷
│ ✐ ꒷ꕤ💎ദ ᴅᴀᴛᴏs ᴅᴇʟ ᴜsᴜᴀʀɪᴏ
│ 📊 ɴɪᴠᴇʟ: ${level} (${exp}/${max})
│ ⚡ xᴘ ᴛᴏᴛᴀʟ: ${totalexp}
│ 👑 ʀᴏʟ: ${role}
│ 💎 ᴘʀᴇᴍɪᴜᴍ: ${prem}
│ ✦ Info » User 🅘
╰─────────────────

╭┈ ↷
│ ✐ ꒷ꕤ💎ദ ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ
│ 🔖 ᴠᴇʀsɪóɴ: ${version}
│ 👥 ᴜsᴜᴀʀɪᴏs: ${totalreg}
│ 📚 ʟɪʙʀᴇʀɪᴀ: Baileys-MD
│ 🛡️ ᴍᴏᴅᴏ: ${global.opts['self'] ? 'Privado' : 'Público'}
│ ⏱️ ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ: ${uptime}
│ ✦ Info » System 🅢
╰─────────────────

╭┈ ↷
│ ✐ ꒷ꕤ💎ദ ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇ ғᴇᴄʜᴀ
│ 🕒 ʜᴏʀᴀ: ${time}
│ 📅 ғᴇᴄʜᴀ: ${date}
│ 🗓️ Dɪᴀ: ${week}
│ ✦ Info » Time 🅣
╰─────────────────`;
  let mention = conn.parseMention(txt);

  try {
    const imageUrl = 'https://iili.io/FpAsm5N.jpg';
    const imageUrl2 = 'https://iili.io/FpA0jrN.jpg';
    let imgRes = await fetch(imageUrl);
    let img = await imgRes.buffer();
    let buttons = [
      { buttonId: ".reg ususario.18", buttonText: { displayText: "✐ ꒷ꕤ👤ദ ᴀᴜᴛᴏ ᴠᴇʀɪғɪᴄᴀʀ" } },
      { buttonId: ".donar", buttonText: { displayText: "✐ ꒷ꕤ🌹ദ ᴅᴏɴᴀʀ" } }
    ];

    let thumbRes = await fetch(imageUrl);
    let thumbBuffer = await thumbRes.buffer();
    let imager = await sharp(thumbBuffer).resize(100, 100).toBuffer();

    let buttonMessage = {
      document: { url: imageUrl2 },
      mimetype: 'image/png',
      fileLength: 1900,
      pageCount: 1,
      jpegThumbnail: imager,
      fileName: `${totalCommands} Comandos`,
      caption: txt,
      footer: '',
      buttons: buttons,
      headerType: 8,
      contextInfo: {
        mentionedJid: mention,
        forwardingScore: 999,
        isForwarded: false,
        externalAdReply: {
          title: ucapan(),
          body: '',
          thumbnail: imager,
          previewType: 0,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: ''
        }
      }
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

    const flowActions = [{
      buttonId: "action",
      buttonText: {
        displayText: "This Button List"
      },
      type: 4,
      nativeFlowInfo: {
        name: "single_select",
        paramsJson: JSON.stringify({
          title: "🫧 sᴇʟᴇᴄᴛ ᴍᴇɴᴜ",
          sections: [{
            title: `ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ`,
            highlight_label: `.ᴍᴇɴᴜ`,
            rows: [{
              header: "🌐 ᴛᴏᴅᴏ ᴇʟ ᴍᴇɴᴜ",
              title: "ᴠᴇʀ ᴛᴏᴅᴏs ʟᴏs ᴄᴏᴍᴀɴᴅᴏs",
              id: `.allmenu`
            }]
          }, {
            title: `ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ`,
            highlight_label: ``,
            rows: [{
              header: "🤖 ɪɴғᴏ ʙᴏᴛ",
              title: "ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ",
              id: `.infobot`
            }, {
              header: "📶 ᴇsᴛᴀᴅᴏ",
              title: "ᴠᴇʀ ᴇsᴛᴀᴅᴏ ᴅᴇʟ ʙᴏᴛ",
              id: `.estado`
            }]
          }, {
            title: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
            highlight_label: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
            rows: [{
              header: "👤 ᴄʀᴇᴀᴅᴏʀ",
              title: "ᴄᴏɴᴛᴀᴄᴛᴀʀ ᴀʟ ᴄʀᴇᴀᴅᴏʀ",
              id: `.owner`
            }, {
              header: "📢 ᴄᴜᴇɴᴛᴀs",
              title: "ᴄᴜᴇɴᴛᴀs oғɪᴄɪᴀʟᴇs",
              id: `.cuentasoficiales`
            }, {
              header: "👥 ɢʀᴜᴘᴏs",
              title: "ɢʀᴜᴘᴏs oғɪᴄɪᴀʟᴇs",
              id: `.grupos`
            }]
          }]
        })
      },
      viewOnce: true
    }];

    buttonMessage.buttons.push(...flowActions);
    await conn.sendMessage(m.chat, buttonMessage, { quoted: menulist });
    await global.menu();
  } catch (error) {
    console.error(error);
    m.reply('Ocurrió un error al procesar el menú.');
  }
};

handler.command = ['tes5'];
export default handler;

function ucapan() {
  const time = moment.tz('America/Lima').format('HH');
  if (time >= 18) return '🌙 ¡Buenas noches!';
  if (time >= 15) return '🌇 ¡Buenas tardes!';
  if (time >= 10) return '☀️ ¡Buen día!';
  if (time >= 4) return '🌄 ¡Buenos días!';
  return '👋 ¡Hola!';
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

global.menu = async function getMenu() {
  let text = '';
  let help = Object.values(global.plugins)
    .filter((plugin) => !plugin.disabled)
    .map((plugin) => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      };
    });

  let tags = {};
  for (let plugin of help) {
    if (plugin && plugin.tags) {
      for (let tag of plugin.tags) {
        if (tag) tags[tag] = tag.toUpperCase();
      }
    }
  }

  for (let category of Object.keys(tags)) {
    let cmds = await Promise.all(
      help
        .filter((menu) => menu.tags && menu.tags.includes(category) && menu.help)
        .map(async (menu) => {
          return await Promise.all(menu.help.map(async (cmd) => `𖦹 𓈒 \`${await style(cmd, 10)}\``));
        })
    );

    if (cmds.length > 0) {
      text += `乂 \`${await style(tags[category], 7)}\`\n\n${cmds.map((cmdArray) => cmdArray.join('\n')).join('\n')}\n\n`;
    }
  }

  text += `\`${global.wm || ''}\``;
  global.menutext = text;
};

var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
var yStr = Object.freeze({
  10: ['𝖺','𝖻','𝖼','𝖽','𝖾','𝖿','𝗀','𝗁','𝗂','𝗃','𝗄','𝗅','𝗆','𝗇','𝗈','𝗉','𝗊','𝗋','𝗌','𝗍','𝗎','𝗏','𝗐','𝗑','𝗒','𝗓','1','2','3','4','5','6','7','8','9','0'],
  7: ['ᗩ','ᗷ','ᑕ','ᗪ','ᗴ','ꜰ','ɢ','ʜ','ɪ','ᴊ','ᴋ','ʟ','ᴍ','ɴ','ᴏ','ᴘ','q','ʀ','ꜱ','ᴛ','ᴜ','ᴠ','ᴡ','x','ʏ','ᴢ','1','2','3','4','5','6','7','8','9','0'],
});

global.style = async function style(text, style = 10) {
  var replacer = [];
  xStr.map((v, i) => replacer.push({ original: v, convert: yStr[style][i] }));
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .split('')
    .map((v) => {
      const find = replacer.find((x) => x.original == v);
      return find ? find.convert : v;
    })
    .join('');
};