import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import { mencion, mono } from './lib/print.js' // Importamos el logger

const baileys = (await import('@whiskeysockets/baileys')).default
const { areJidsSameUser, jidDecode } = baileys

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// =======================
// JID helpers
// =======================
const DIGITS = v => String(v || '').replace(/\D+/g, '')
const looksPhoneJid = v => /^\d+@s\.whatsapp\.net$/i.test(String(v || ''))

const numberToJid = (num = '') => {
  const n = DIGITS(num)
  return n ? `${n}@s.whatsapp.net` : null
}

const normalizeJid = (id = '') => {
  if (!id) return null
  let s = String(id).trim().toLowerCase()
  if (!/@/.test(s)) {
    const j = numberToJid(s)
    if (j) return j
  }
  if (/:\d+@/i.test(s)) {
    try {
      const j = jidDecode(s)
      if (j?.user && j?.server) s = `${j.user}@${j.server}`
    } catch {}
  }
  if (!looksPhoneJid(s)) {
    const j = numberToJid(DIGITS(s))
    if (j) return j
  }
  return s
}

const sameUser = (a, b) => {
  if (!a || !b) return false
  if (areJidsSameUser?.(a, b)) return true
  return DIGITS(a) === DIGITS(b)
}

// =======================
// Handler Principal
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
    const M = smsg(this, m) || m
    if (!M) return

    m = {
      ...M,
      chat: normalizeJid(M.chat),
      sender: normalizeJid(M.sender),
      exp: 0,
      coin: false
    }

    // --- LOGGING DE MENSAJES ---
    if (m.message) {
        const remitente = m.isGroup ? `${mencion(m.sender)} en ${mencion(m.chat)}` : `${mencion(m.sender)} (privado)`
        const tipoMsg = Object.keys(m.message)[0]
        const contenido = m.text ? `'${m.text}'` : `(${tipoMsg})`
        console.log(chalk.blue('┌─── MENSAJE ───┐'))
        console.log(chalk.cyan('│'), 'De:', remitente)
        console.log(chalk.cyan('│'), 'Tipo:', tipoMsg)
        console.log(chalk.cyan('└'), 'Contenido:', contenido)
    }

    const conn = this
    const opts = global.opts || {}
    const selfJid = normalizeJid(conn?.user?.id)

    // --- Manejo de base de datos (usuarios, chats, settings) ---
    try {
        let user = global.db.data.users[m.sender]
        if (typeof user !== 'object') global.db.data.users[m.sender] = {}
        if (user) {
            // Inicialización de valores por defecto para el usuario
            user.exp = user.exp || 0
            user.coin = user.coin || 10
            user.registered = user.registered || false
            if (!user.registered) {
                user.name = user.name || m.name
                user.age = user.age || -1
                user.regTime = user.regTime || -1
            }
            // ... (puedes añadir más valores por defecto si lo necesitas)
        } else {
            global.db.data.users[m.sender] = {
                exp: 0,
                coin: 10,
                registered: false,
                name: m.name,
                age: -1,
                regTime: -1,
                // ... (más valores iniciales)
            }
        }

        let chat = global.db.data.chats[m.chat]
        if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
        if (chat) {
            chat.isBanned = chat.isBanned || false
            chat.welcome = chat.welcome ?? true
            chat.detect = chat.detect ?? true
            chat.antiLink = chat.antiLink ?? true
            // ... (más valores por defecto para el chat)
        } else {
            global.db.data.chats[m.chat] = {
                isBanned: false,
                welcome: true,
                detect: true,
                antiLink: true,
                // ... (más valores iniciales)
            }
        }
        
        let settings = global.db.data.settings[selfJid]
        if (typeof settings !== 'object') global.db.data.settings[selfJid] = {}
        if (settings) {
            settings.self = settings.self ?? false
            settings.autoread = settings.autoread ?? false
        } else {
            global.db.data.settings[selfJid] = {
                self: false,
                autoread: false,
            }
        }
    } catch (e) {
      console.error('Error al inicializar la base de datos:', e)
    }

    const ownerJids = global.owner.map(owner => numberToJid(Array.isArray(owner) ? owner[0] : owner)).filter(Boolean)
    const isROwner = ownerJids.some(j => sameUser(j, m.sender))
    const isOwner = isROwner || m.fromMe
    const _user = global.db.data.users[m.sender] || {}
    const isPrems = _user.premium === true

    if (opts['nyimak']) return
    if (!isROwner && opts['self']) return
    if (typeof m.text !== 'string') m.text = ''

    // --- LOOP DE PLUGINS ---
    const ___dirname = path.dirname(fileURLToPath(import.meta.url))
    
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(___dirname, './plugins', name)

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
        } catch (e) { console.error(`Error en plugin.all (${name}):`, e) }
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
      
      const match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => {
        const re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
        return [re.exec(m.text), re]
      }) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[0])

      if (!match) continue

      // --- Si hay match, es un comando ---
      const usedPrefix = match[0][0]
      const noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v)
      command = (command || '').toLowerCase()
      const text = args.join(' ')

      const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false
      
      if (!isAccept) continue

      // --- LOGGING DE COMANDOS ---
      console.log(chalk.yellow('┌─── COMANDO ───┐'))
      console.log(chalk.magenta('│'), 'Comando:', mono(usedPrefix + command))
      console.log(chalk.magenta('│'), 'Usuario:', mencion(m.sender))
      console.log(chalk.magenta('└'), 'Plugin:', mono(name))

      // --- Guardas y restricciones ---
      const groupMetadata = m.isGroup ? (conn.chats[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(() => null)) : {}
      const participants = m.isGroup ? groupMetadata.participants : []
      const userAdmin = m.isGroup ? participants.find(p => sameUser(p.id, m.sender))?.admin : ''
      const botAdmin = m.isGroup ? participants.find(p => sameUser(p.id, selfJid))?.admin : ''
      const isAdmin = userAdmin === 'admin' || userAdmin === 'superadmin'
      const isBotAdmin = botAdmin === 'admin' || botAdmin === 'superadmin'

      let fail = plugin.fail || global.dfail
      if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
      if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
      if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
      if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
      if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
      if (plugin.private && m.isGroup) { fail('private', m.this); continue }
      if (plugin.register && !_user.registered) { fail('unreg', m, this); continue }

      m.isCommand = true
      
      try {
          await plugin.call(this, m, {
            conn: this,
            usedPrefix,
            command,
            args,
            text,
            isROwner,
            isOwner,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
      } catch (e) {
          m.error = e
          console.error(`Error en el plugin '${name}':`, e)
          const textErr = format(e)
          try {
              await this.reply(m.chat, `Ocurrió un error al ejecutar el comando *${command}*.\n\n` + '```' + textErr + '```', m)
          } catch (err) {
              console.error('Error al enviar el mensaje de error:', err)
          }
      }
    }

  } catch (e) {
    console.error('Error fatal en el handler:', e)
  }
}

// ====== Mensajes de fallo por rol ======
global.dfail = (type, m, conn) => {
  const msg = {
    owner: `Este comando solo puede ser usado por mi Creador.`,
    premium: `Este comando es solo para usuarios Premium.`,
    group: `Este comando solo puede ser usado en grupos.`,
    private: `Este comando solo puede ser usado en chat privado.`,
    admin: `Este comando es solo para los administradores del grupo.`,
    botAdmin: `¡Necesito ser administrador para ejecutar ese comando!`,
    unreg: `No estás registrado. Escribe *.reg* para registrarte.`
  }[type]
  if (msg) return m.reply(msg)
}
