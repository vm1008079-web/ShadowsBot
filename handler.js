import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

// Import Baileys helpers (areJidsSameUser / jidDecode)
const baileys = (await import('@whiskeysockets/baileys')).default
const { proto, areJidsSameUser, jidDecode } = baileys

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// =======================
// JID helpers (puro JID)
// =======================
const DIGITS = v => String(v || '').replace(/\D+/g, '')
const looksPhoneJid = v => /^\d+@s\.whatsapp\.net$/i.test(String(v || ''))

// Convierte "123456789" -> "123456789@s.whatsapp.net"
const numberToJid = (num = '') => {
  const n = DIGITS(num)
  return n ? `${n}@s.whatsapp.net` : null
}

// Normaliza a JID telefónico (quita :device; si trae number suelto lo convierte)
const normalizeJid = (id = '') => {
  if (!id) return null
  let s = String(id).trim().toLowerCase()
  // si viene número suelto o @lid, conviértelo a @s.whatsapp.net
  if (!/@/.test(s)) {
    const j = numberToJid(s)
    if (j) return j
  }
  // quita subjid de dispositivo (user:device@server -> user@server)
  if (/:\d+@/i.test(s)) {
    try {
      const j = jidDecode(s)
      if (j?.user && j?.server) s = `${j.user}@${j.server}`
    } catch {}
  }
  // si termina con @lid u otro dominio raro, intenta obtener sólo los dígitos
  if (!looksPhoneJid(s)) {
    const j = numberToJid(DIGITS(s))
    if (j) return j
  }
  return s
}

// Comparación robusta de JIDs (acepta formatos distintos si los dígitos coinciden)
const sameUser = (a, b) => {
  if (!a || !b) return false
  if (areJidsSameUser?.(a, b)) return true
  return DIGITS(a) === DIGITS(b)
}

// =======================
// Handler
// =======================
export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return

  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    // ---- [INICIO DE LA CORRECCIÓN] ----
    // Serializa el mensaje
    const M = smsg(this, m) || m
    if (!M) return
    
    // Crea un nuevo objeto 'm' con las propiedades de 'M', pero con 'chat' y 'sender' normalizados
    m = {
      ...M, // Copia todas las propiedades de M
      chat: normalizeJid(M.chat), // Sobrescribe 'chat' con la versión normalizada
      sender: normalizeJid(M.sender), // Sobrescribe 'sender' con la versión normalizada
      exp: 0,
      coin: false
    }
    // ---- [FIN DE LA CORRECCIÓN] ----

    const conn = this
    const opts = global.opts || {}

    // ------ ensure settings keyed by pure JID of the bot ------
    const selfJid = normalizeJid(conn?.user?.id || conn?.user?.jid)
    const settingsKey = selfJid
    let settings = global.db.data.settings[settingsKey]
    if (typeof settings !== 'object') global.db.data.settings[settingsKey] = {}
    settings = global.db.data.settings[settingsKey]
    if (settings) {
      if (!('self' in settings)) settings.self = false
      if (!('restrict' in settings)) settings.restrict = true
      if (!('jadibotmd' in settings)) settings.jadibotmd = true
      if (!('antiPrivate' in settings)) settings.antiPrivate = false
      if (!('autoread' in settings)) settings.autoread = false
      if (!('status' in settings)) settings.status = 0
    }

    // ------ USERS ------
    try {
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {}
      if (user) {
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.coin)) user.coin = 10
        if (!isNumber(user.joincount)) user.joincount = 1
        if (!isNumber(user.diamond)) user.diamond = 3
        if (!isNumber(user.lastadventure)) user.lastadventure = 0
        if (!isNumber(user.lastclaim)) user.lastclaim = 0
        if (!isNumber(user.health)) user.health = 100
        if (!isNumber(user.crime)) user.crime = 0
        if (!isNumber(user.lastcofre)) user.lastcofre = 0
        if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0
        if (!isNumber(user.lastpago)) user.lastpago = 0
        if (!isNumber(user.lastcode)) user.lastcode = 0
        if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
        if (!isNumber(user.lastduel)) user.lastduel = 0
        if (!isNumber(user.lastmining)) user.lastmining = 0
        if (!('muto' in user)) user.muto = false
        if (!('premium' in user)) user.premium = false
        if (!user.premium) user.premiumTime = 0
        if (!('registered' in user)) user.registered = false
        if (!('genre' in user)) user.genre = ''
        if (!('birth' in user)) user.birth = ''
        if (!('marry' in user)) user.marry = ''
        if (!('description' in user)) user.description = ''
        if (!('packstickers' in user)) user.packstickers = null
        if (!user.registered) {
          if (!('name' in user)) user.name = m.name
          if (!isNumber(user.age)) user.age = -1
          if (!isNumber(user.regTime)) user.regTime = -1
        }
        if (!isNumber(user.afk)) user.afk = -1
        if (!('afkReason' in user)) user.afkReason = ''
        if (!('role' in user)) user.role = 'Nuv'
        if (!('banned' in user)) user.banned = false
        if (!('useDocument' in user)) user.useDocument = false
        if (!isNumber(user.level)) user.level = 0
        if (!isNumber(user.bank)) user.bank = 0
        if (!isNumber(user.warn)) user.warn = 0
      } else {
        global.db.data.users[m.sender] = {
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
          premiumTime: 0
        }
      }

      // ------ CHATS (siempre con m.chat en @g.us y primario en @s.whatsapp.net) ------
      let chat = global.db.data.chats[m.chat]
      if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
      chat = global.db.data.chats[m.chat]
      if (chat) {
        if (!('isBanned' in chat)) chat.isBanned = false
        if (!('sAutoresponder' in chat)) chat.sAutoresponder = ''
        if (!('welcome' in chat)) chat.welcome = true
        if (!('autolevelup' in chat)) chat.autolevelup = false
        if (!('autoAceptar' in chat)) chat.autoAceptar = false
        if (!('autosticker' in chat)) chat.autosticker = false
        if (!('autoRechazar' in chat)) chat.autoRechazar = false
        if (!('autoresponder' in chat)) chat.autoresponder = false
        if (!('detect' in chat)) chat.detect = true
        if (!('antiBot' in chat)) chat.antiBot = false
        if (!('antiBot2' in chat)) chat.antiBot2 = false
        if (!('modoadmin' in chat)) chat.modoadmin = false
        if (!('antiLink' in chat)) chat.antiLink = true
        if (!('reaction' in chat)) chat.reaction = false
        if (!('nsfw' in chat)) chat.nsfw = false
        if (!('antifake' in chat)) chat.antifake = false
        if (!('delete' in chat)) chat.delete = false
        if (!isNumber(chat.expired)) chat.expired = 0
        // migración silenciosa a JID telefónico para primaryBot si fuera necesario
        if (chat.primaryBot && !looksPhoneJid(chat.primaryBot)) {
          const fixed = numberToJid(chat.primaryBot)
          if (fixed) chat.primaryBot = fixed
        }
      } else {
        global.db.data.chats[m.chat] = {
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
          per: []
        }
      }
    } catch (e) {
      console.error(e)
    }

    // ------ roles globales SIEMPRE en JID telefónico ------
    const ownerJids = []
    if (Array.isArray(global.owner)) {
      for (const row of global.owner) {
        const num = Array.isArray(row) ? row[0] : row
        const j = numberToJid(num)
        if (j) ownerJids.push(j)
      }
    }
    const modsJids = Array.isArray(global.mods) ? global.mods.map(n => numberToJid(n)).filter(Boolean) : []
    const premsJids = Array.isArray(global.prems) ? global.prems.map(n => numberToJid(n)).filter(Boolean) : []

    const isROwner = ownerJids.some(j => sameUser(j, m.sender))
    const isOwner = isROwner || m.fromMe
    const isMods = isROwner || modsJids.some(j => sameUser(j, m.sender))
    const _user = global.db.data?.users?.[m.sender] || {}
    const isPrems = isROwner || premsJids.some(j => sameUser(j, m.sender)) || _user.premium === true

    // ------ drops tempranos ------
    if (m.isBaileys) return
    if (opts['nyimak']) return
    if (!isROwner && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    // ------ GATE de primario (sólo JID) ------
    if (m.isGroup) {
      const chat = global.db.data.chats[m.chat]
      const primary = chat?.primaryBot ? normalizeJid(chat.primaryBot) : null
      if (primary && selfJid && !sameUser(primary, selfJid)) {
        // sólo permiten comandos de gestión del primario; si no, salimos
        // ajusta si quieres Whitelist
        return
      }
    }

    // ------ Cola básica ------
    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key?.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    m.exp += Math.ceil(Math.random() * 10)

    // ------ Metadatos de grupo + admins (puro JID) ------
    const groupMetadata = m.isGroup
      ? ((conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null))
      : {}
    const participants = m.isGroup ? (groupMetadata?.participants || []) : []

    // indexamos participantes por JID telefónico
    const idx = participants.map(p => {
      const jid = normalizeJid(p?.id || p?.jid || p?.participant || '')
      return { jid, admin: p?.admin }
    })
    const senderEntry = idx.find(x => sameUser(x.jid, m.sender)) || {}
    const botEntry = idx.find(x => sameUser(x.jid, selfJid)) || {}
    const isRAdmin = senderEntry?.admin === 'superadmin'
    const isAdmin = isRAdmin || senderEntry?.admin === 'admin'
    const isBotAdmin = !!botEntry?.admin

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    // =======================
    //  LOOP DE PLUGINS
    // =======================
    let usedPrefix = ''
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin) continue
      if (plugin.disabled) continue
      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
        } catch (e) { console.error(e) }
      }

      if (!opts['restrict'])
        if (plugin.tags && plugin.tags.includes('admin')) {
          continue
        }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix

      let match = (_prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
          ? _prefix.map(p => {
              let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
              return [re.exec(m.text), re]
            })
          : typeof _prefix === 'string'
            ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
            : [[[], new RegExp]]
      ).find(p => p[0])

      if (typeof plugin.before === 'function') {
        try {
          const br = await plugin.before.call(this, m, {
            match,
            conn: this,
            participants,
            groupMetadata,
            user: senderEntry,
            bot: botEntry,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
          if (br) continue
        } catch (e) { console.error(e) }
      }

      if (typeof plugin !== 'function') continue

      if ((usedPrefix = (match?.[0]?.[0] || ''))) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v)
        args = args || []
        let _args = noPrefix.trim().split(/\s+/).slice(1)
        let text = _args.join(' ')
        command = (command || '').toLowerCase()
        let fail = plugin.fail || global.dfail
        let isAccept =
          plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
              ? plugin.command.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))
              : typeof plugin.command === 'string'
                ? plugin.command === command
                : false

        global.comando = command

        // descartar ACKs conocidos
        if (m.id && (
          m.id.startsWith('NJX-') ||
          (m.id.startsWith('BAE5') && m.id.length === 16) ||
          (m.id.startsWith('B24E') && m.id.length === 20)
        )) return

        if (!isAccept) continue
        m.plugin = name

        // guardas de ban
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          let chat = global.db.data.chats[m.chat]
          let user = global.db.data.users[m.sender]
          if (!['grupo-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return
          if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return
          if (m.text && user?.banned && !isROwner) {
            m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
            return
          }
        }

        // modo admin del chat
        const adminMode = (global.db.data.chats[m.chat] || {}).modoadmin
        const anyReq = plugin.botAdmin || plugin.admin || plugin.group
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && anyReq) return

        // guardas por rol
        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail?.('owner', m, this, usedPrefix, command); continue }
        if (plugin.rowner && !isROwner) { fail?.('rowner', m, this, usedPrefix, command); continue }
        if (plugin.owner && !isOwner) { fail?.('owner', m, this, usedPrefix, command); continue }
        if (plugin.mods && !isMods) { fail?.('mods', m, this, usedPrefix, command); continue }
        if (plugin.premium && !isPrems) { fail?.('premium', m, this, usedPrefix, command); continue }
        if (plugin.group && !m.isGroup) { fail?.('group', m, this, usedPrefix, command); continue }
        if (plugin.botAdmin && !isBotAdmin) { fail?.('botAdmin', m, this, usedPrefix, command); continue }
        if (plugin.admin && !isAdmin) { fail?.('admin', m, this, usedPrefix, command); continue }
        if (plugin.private && m.isGroup) { fail?.('private', m, this, usedPrefix, command); continue }
        if (plugin.register === true && _user.registered === false) { fail?.('unreg', m, this, usedPrefix, command); continue }

        // economía/nivel
        m.isCommand = true
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
        m.exp += xp

        if (!isPrems && plugin.coin && (global.db.data.users[m.sender]?.coin || 0) < plugin.coin * 1) {
          this.reply(m.chat, `❮✦❯ Se agotaron tus ${global.moneda || 'monedas'}`, m)
          continue
        }
        if (plugin.level > (_user.level || 0)) {
          this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level || 0}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
          continue
        }

        // extra para plugins
        const extra = {
          match,
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text,
          conn: this,
          participants,
          groupMetadata,
          user: senderEntry,
          bot: botEntry,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename: __filename
        }

        try {
          await plugin.call(this, m, extra)
          if (!isPrems) m.coin = m.coin || plugin.coin || false
        } catch (e) {
          m.error = e
          console.error(e)
          if (e) {
            const textErr = format(e)
            try { await this.reply(m.chat, textErr, m) } catch {}
          }
        }
      }
    }

  } catch (e) {
    console.error(e)
  }
}

// ====== Mensajes de fallo por rol ======
global.dfail = (type, m, conn) => {
  const msg = {
    owner: `🍿 Este comando solo puede ser ejecutado por mi Creador.`,
    rowner: `🍿 Este comando solo puede ser ejecutado por el Creador real.`,
    mods: `🌿 Requiere moderador.`,
    premium: `💎 Comando solo para usuarios Premium.`,
    group: `👥 Este comando es solo para grupos.`,
    private: `💬 Este comando es solo para chats privados.`,
    admin: `🧃 Este comando solo puede ser ejecutado por los Administradores del Grupo.`,
    botAdmin: `🍂 Necesito ser Administrador para ejecutar ese comando.`,
    unreg: `📝 Necesitas registrarte para usar este comando.`
  }[type]
  if (msg) return m.reply(msg)
}
