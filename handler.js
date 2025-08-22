import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import NodeCache from 'node-cache'; // Importar NodeCache

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

// Usar un caché para datos de usuario y grupo
const userCache = new NodeCache({ stdTTL: 3600 }); // TTL de 1 hora
const chatCache = new NodeCache({ stdTTL: 3600 }); // TTL de 1 hora

/**
 * * @param {import('@whiskeysockets/baileys').WAConnection} conn
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<any>['messages.upsert']} chatUpdate
 */
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate)
        return

    // Usar setImmediate para que la lectura de mensajes no bloquee el hilo principal
    setImmediate(() => this.pushMessage(chatUpdate.messages).catch(console.error));

    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    if (global.db.data == null) await global.loadDatabase();

    try {
        m = smsg(this, m) || m;
        if (!m) return;

        m.exp = 0;
        m.coin = false;

        const sender = m.sender;
        const chat = m.chat;
        const isGroup = m.isGroup;

        // Cargar datos de usuario y chat desde el caché o la base de datos
        let user = userCache.get(sender);
        if (!user) {
            if (typeof global.db.data.users[sender] !== 'object') global.db.data.users[sender] = {};
            user = global.db.data.users[sender];
            userCache.set(sender, user);
        }

        // Si el usuario no existe, crearlo y marcar la DB como modificada
        if (!user || Object.keys(user).length === 0) {
            global.db.data.users[sender] = {
                exp: 0,
                coin: 10,
                joincount: 1,
                diamond: 3,
                lastadventure: 0,
                health: 100,
                lastclaim: 0,
                lastcofre: 0,
                lastdiamantes: 0,
                lastcode: 0,
                lastduel: 0,
                lastpago: 0,
                lastmining: 0,
                lastcodereg: 0,
                muto: false,
                registered: false,
                genre: '',
                birth: '',
                marry: '',
                description: '',
                packstickers: null,
                name: m.name,
                age: -1,
                regTime: -1,
                afk: -1,
                afkReason: '',
                banned: false,
                useDocument: false,
                bank: 0,
                level: 0,
                role: 'Nuv',
                premium: false,
                premiumTime: 0,
            };
            global.markDatabaseModified();
            user = global.db.data.users[sender]; // Recargar el objeto de usuario
        }

        // Cargar datos de chat desde el caché o la base de datos
        let chatData = null;
        if (isGroup) {
            chatData = chatCache.get(chat);
            if (!chatData) {
                if (typeof global.db.data.chats[chat] !== 'object') global.db.data.chats[chat] = {};
                chatData = global.db.data.chats[chat];
                chatCache.set(chat, chatData);
            }
        }

        // Si el chat no existe, crearlo y marcar la DB como modificada
        if (isGroup && (!chatData || Object.keys(chatData).length === 0)) {
            global.db.data.chats[chat] = {
                isBanned: false,
                sAutoresponder: '',
                welcome: true,
                autolevelup: false,
                autoresponder: false,
                delete: false,
                autoAceptar: false,
                autoRechazar: false,
                detect: true,
                antiBot: false,
                antiBot2: false,
                modoadmin: false,
                antiLink: true,
                antifake: false,
                reaction: false,
                nsfw: false,
                expired: 0,
                antiLag: false,
                per: [],
            };
            global.markDatabaseModified();
            chatData = global.db.data.chats[chat]; // Recargar el objeto de chat
        }

        // Inicializar datos del usuario si son nulos (manejado en el if !user de arriba)
        const userDefaults = {
            exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0, health: 100, lastclaim: 0, lastcofre: 0, lastdiamantes: 0, lastcode: 0, lastduel: 0, lastpago: 0, lastmining: 0, lastcodereg: 0,
            muto: false, registered: false, genre: '', birth: '', marry: '', description: '', packstickers: null, name: m.name, age: -1, regTime: -1, afk: -1, afkReason: '', banned: false, useDocument: false, bank: 0, level: 0, role: 'Nuv', premium: false, premiumTime: 0
        };

        for (const key in userDefaults) {
            if (user[key] === undefined) {
                user[key] = userDefaults[key];
                global.markDatabaseModified();
            }
        }

        if (isGroup) {
            const chatDefaults = {
                isBanned: false, sAutoresponder: '', welcome: true, autolevelup: false, autoresponder: false, delete: false, autoAceptar: false, autoRechazar: false,
                detect: true, antiBot: false, antiBot2: false, modoadmin: false, antiLink: true, antifake: false, reaction: false, nsfw: false, expired: 0, antiLag: false, per: []
            };
            for (const key in chatDefaults) {
                if (chatData[key] === undefined) {
                    chatData[key] = chatDefaults[key];
                    global.markDatabaseModified();
                }
            }
        }

        const settings = global.db.data.settings[this.user.jid] || {};
        if (Object.keys(global.db.data.settings[this.user.jid]).length === 0) {
            global.db.data.settings[this.user.jid] = { self: false, restrict: true, jadibotmd: true, antiPrivate: false, autoread: false, status: 0 };
            global.markDatabaseModified();
        }

        if (m.isBaileys) return;
        if (opts['nyimak']) return;
        if (!isROwner && opts['self']) return;
        if (opts['swonly'] && chat !== 'status@broadcast') return;
        if (typeof m.text !== 'string') m.text = '';

        if (isGroup && chatData?.primaryBot && this?.user?.jid !== chatData.primaryBot) {
            return;
        }

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        m.exp += Math.ceil(Math.random() * 10);

        const getLidFromJid = async (id, conn) => {
            if (id.endsWith('@lid')) return id;
            const res = await conn.onWhatsApp(id).catch(() => []);
            return res[0]?.lid || id;
        };

        // Optimizar la búsqueda de roles de usuario y bot en el grupo
        const groupMetadata = isGroup ? (conn.chats[chat] || {}).metadata || await this.groupMetadata(chat).catch(_ => null) : {};
        const participants = isGroup ? groupMetadata.participants || [] : [];
        const botId = this.user.id.includes(':') ? `${this.user.id.split(':')[0]}@s.whatsapp.net` : this.user.id;

        const userParticipant = participants.find(p => p.id === sender);
        const botParticipant = participants.find(p => p.id === botId);

        const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);
        const isOwner = isROwner || m.fromMe;
        const isRAdmin = userParticipant?.admin === "superadmin";
        const isAdmin = isRAdmin || userParticipant?.admin === "admin";
        const isBotAdmin = !!botParticipant?.admin;
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender) || user?.premium;
        const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

        let usedPrefix = '';
        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin) continue;
            if (plugin.disabled) continue;

            const __filename = join(___dirname, name);
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename });
                } catch (e) {
                    console.error(e);
                }
            }

            if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) {
                continue;
            }

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
            let match = (_prefix instanceof RegExp ?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                    return [re.exec(m.text), re];
                }) :
                typeof _prefix === 'string' ?
                [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[[], new RegExp]]
            ).find(p => p[1]);

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, user, bot: botParticipant, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                })) continue;
            }

            if (typeof plugin !== 'function') continue;

            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '');
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v);
                args = args || [];
                let _args = noPrefix.trim().split` `.slice(1);
                let text = _args.join` `;
                command = (command || '').toLowerCase();
                let fail = plugin.fail || global.dfail;
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false;

                global.comando = command;

                if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return;
                if (!isAccept) continue;

                m.plugin = name;

                // Mover validaciones de usuario y chat al inicio para un retorno rápido
                if (user.muto && !isOwner) { // Mover esta validación al inicio del handler
                    let bang = m.key.id;
                    let cancellazzione = m.key.participant;
                    await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione } });
                    return;
                }

                if (isGroup) {
                    if (!['grupo-unbanchat.js'].includes(name) && chatData?.isBanned && !isROwner) return;
                }
                if (user.banned && !isROwner) {
                    m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`);
                    return;
                }

                let adminMode = isGroup ? chatData.modoadmin : false;
                if (adminMode && !isOwner && !isROwner && !isAdmin) return;

                if (plugin.rowner && !isROwner) { fail('rowner', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.owner && !isOwner) { fail('owner', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.mods && !isMods) { fail('mods', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.premium && !isPrems) { fail('premium', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.group && !isGroup) { fail('group', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.admin && !isAdmin) { fail('admin', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.private && isGroup) { fail('private', m, this, usedPrefix, command, isROwner); continue; }
                if (plugin.register && !user.registered) { fail('unreg', m, this, usedPrefix, command, isROwner); continue; }

                m.isCommand = true;
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10;
                m.exp += xp;
                if (!isPrems && plugin.coin && user.coin < plugin.coin * 1) {
                    this.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m);
                    continue;
                }
                if (plugin.level > user.level) {
                    this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m);
                    continue;
                }

                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user: userParticipant, bot: botParticipant, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                };

                try {
                    await plugin.call(this, m, extra);
                    if (!isPrems) m.coin = m.coin || plugin.coin || false;
                } catch (e) {
                    m.error = e;
                    console.error(e);
                    if (e) {
                        let text = format(e);
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), 'Administrador');
                        m.reply(text);
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (m.coin) this.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m);
                }
                break;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id);
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1);
        }

        // Optimizar el guardado de XP, monedas y estadísticas
        if (m) {
            let user = global.db.data.users[m.sender];
            if (user) {
                user.exp += m.exp;
                user.coin -= m.coin * 1;
                global.markDatabaseModified(); // Marcar para guardar
            }

            let stat;
            if (m.plugin) {
                let now = +new Date();
                let stats = global.db.data.stats;
                if (!stats[m.plugin]) stats[m.plugin] = { total: 0, success: 0, last: 0, lastSuccess: 0 };

                stat = stats[m.plugin];
                stat.total += 1;
                stat.last = now;
                if (m.error == null) {
                    stat.success += 1;
                    stat.lastSuccess = now;
                }
                global.markDatabaseModified(); // Marcar para guardar
            }
        }

        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this);
        } catch (e) {
            console.log(m, m.quoted, e);
        }

        if (global.db.data.settings[this.user.jid]?.autoread) {
            // Mover la lectura de mensajes a un setImmediate para no bloquear
            setImmediate(() => this.readMessages([m.key]));
        }

        if (global.db.data.chats[m.chat]?.reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
            const emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"]);
            if (!m.fromMe) this.sendMessage(m.chat, { react: { text: emot, key: m.key } });
        }
    }
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }

global.dfail = (type, m, conn, usedPrefix, command, isROwner) => { // 'isROwner' se agrega como argumento
    let edadaleatoria = ['10', '28', '20', '40', '18', '21', '15', '11', '9', '17', '25'].getRandom()
    let user2 = m.pushName || 'Anónimo'
    let verifyaleatorio = ['registrar', 'reg', 'verificar', 'verify', 'register'].getRandom()

    const msg = {
        rowner: '🔐 Solo el Creador del Bot puede usar este comando.',
        owner: '👑 Solo el Creador y Sub Bots pueden usar este comando.',
        mods: '🛡️ Solo los Moderadores pueden usar este comando.',
        premium: '💎 Solo usuarios Premium pueden usar este comando.',
        group: '「✧」 Este comando es sólo para grupos.',
        private: '🔒 Solo en Chat Privado puedes usar este comando.',
        admin: '⚔️ Solo los Admins del Grupo pueden usar este comando.',
        botAdmin: 'El bot debe ser Admin para ejecutar esto.',
        unreg: '> 🔰 Debes estar Registrado para usar este comando.\n\n Ejemplo : #reg Ado.55',
        restrict: '⛔ Esta función está deshabilitada.'
    }[type];

    if (msg)
        return conn.reply(m.chat, msg, m, { contextInfo: rcanal }).then(() => conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } }))

    let file = global.__filename(import.meta.url, true)
    watchFile(file, async () => {
        unwatchFile(file)
        console.log(chalk.magenta("Se actualizo 'handler.js'"))

        if (global.conns && global.conns.length > 0) {
            const users = [...new Set([...global.conns
                .filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
                .map(conn => conn)])]
            for (const userr of users) {
                userr.subreloadHandler(false)
            }
        }
    })
}
