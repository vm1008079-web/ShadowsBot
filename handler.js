import { smsg } from './lib/simple.js'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import { format } from 'util'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(res => setTimeout(res, ms))

export async function handler(chatUpdate) {
  if (!chatUpdate) return

  this.msgqueque ||= []

  try {
    await this.pushMessage(chatUpdate.messages)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return

    m = smsg(this, m) || m
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()

    m.exp = 0
    m.limit = false

    const user = global.db.data.users[m.sender] ||= {}
    const chat = global.db.data.chats[m.chat] ||= {}
    const settings = global.db.data.settings[this.user.jid] ||= {}

    // Inicializa campos de usuario
    Object.assign(user, {
      exp: user.exp ?? 0,
      limit: user.limit ?? 10,
      premium: user.premium ?? false,
      premiumTime: user.premiumTime ?? 0,
      registered: user.registered ?? false,
      name: user.name ?? m.name,
      age: user.age ?? -1,
      regTime: user.regTime ?? -1,
      afk: user.afk ?? -1,
      afkReason: user.afkReason ?? '',
      banned: user.banned ?? false,
      useDocument: user.useDocument ?? false,
      level: user.level ?? 0,
      bank: user.bank ?? 0
    })

    // Inicializa campos del chat
    Object.assign(chat, {
      isBanned: chat.isBanned ?? false,
      bienvenida: chat.bienvenida ?? true,
      antiLink: chat.antiLink ?? false,
      onlyLatinos: chat.onlyLatinos ?? false,
      nsfw: chat.nsfw ?? false,
      expired: chat.expired ?? 0
    })

    Object.assign(settings, {
      self: settings.self ?? false,
      autoread: settings.autoread ?? false
    })

    if (opts.nyimak || (opts.self && !m.fromMe)) return
    if (opts.swonly && m.chat !== 'status@broadcast') return

    if (typeof m.text !== 'string') m.text = ''

    const isROwner = [conn.decodeJid(conn.user.id), ...global.owner.map(([n]) => n)]
      .map(n => n.replace(/\D/g, '') + '@s.whatsapp.net')
      .includes(m.sender)

    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods?.map(n => n.replace(/\D/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems = isROwner || global.prems?.map(n => n.replace(/\D/g, '') + '@s.whatsapp.net').includes(m.sender) || user.premium

    // Cola si hay queue
    if (opts.queque && m.text && !(isMods || isPrems)) {
      let queue = this.msgqueque
      let waitTime = 5 * 1000
      const prev = queue[queue.length - 1]
      queue.push(m.id || m.key.id)
      const interval = setInterval(async () => {
        if (!queue.includes(prev)) clearInterval(interval)
        await delay(waitTime)
      }, waitTime)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    let usedPrefix

    const groupMetadata = m.isGroup ? (conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => null)) : {}
    const participants = m.isGroup ? groupMetadata?.participants || [] : []
    const sender = conn.decodeJid(m.sender)
    const userData = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === sender) : {}
    const botData = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === this.user.jid) : {}

    const isRAdmin = userData?.admin === 'superadmin'
    const isAdmin = isRAdmin || userData?.admin === 'admin'
    const isBotAdmin = botData?.admin

    const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    for (let name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(__dirname, name)

      if (typeof plugin.all === 'function') {
        try { await plugin.all.call(this, m, { chatUpdate, __dirname, __filename }) } catch (e) { console.error(e) }
      }

      if (!opts.restrict && plugin.tags?.includes('admin')) continue

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      const _prefix = plugin.customPrefix || conn.prefix || global.prefix
      const match = (_prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
          ? _prefix.map(p => {
              const re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
              return [re.exec(m.text), re]
            })
          : typeof _prefix === 'string'
            ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
            : [[[], new RegExp()]]
      ).find(p => p[1])

      if (!match || typeof plugin !== 'function') continue

      if (typeof plugin.before === 'function') {
        const shouldSkip = await plugin.before.call(this, m, {
          match, conn: this, participants, groupMetadata, user: userData, bot: botData,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
          chatUpdate, __dirname, __filename
        })
        if (shouldSkip) continue
      }

      if ((usedPrefix = (match[0] || '')[0])) {
        const noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split(/\s+/)
        const _args = noPrefix.trim().split(/\s+/).slice(1)
        const text = _args.join(' ')
        command = command?.toLowerCase()
        const fail = plugin.fail || global.dfail
        const isAccept = plugin.command instanceof RegExp
          ? plugin.command.test(command)
          : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
            : plugin.command === command

        if (!isAccept) continue

        m.plugin = name

        if (chat?.isBanned && name !== 'group-unbanchat.js') return
        if (user?.banned && name !== 'owner-unbanuser.js') return
        if (settings?.banned && name !== 'owner-unbanbot.js') return

        // Verificaciones de permisos
        if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
        if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
        if (plugin.mods && !isMods) { fail('mods', m, this); continue }
        if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
        if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
        if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
        if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
        if (plugin.private && m.isGroup) { fail('private', m, this); continue }
        if (plugin.register && !user.registered) { fail('unreg', m, this); continue }

        m.isCommand = true
        const xp = plugin.exp ?? 17
        m.exp += xp

        if (!isPrems && plugin.limit && user.limit < plugin.limit) {
          conn.reply(m.chat, 'Se agotaron tus *Chocos*', m)
          continue
        }

        const extra = {
          match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
          participants, groupMetadata, user: userData, bot: botData,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
          chatUpdate, __dirname, __filename
        }

        try {
          await plugin.call(this, m, extra)
          if (!isPrems && plugin.limit) m.limit = plugin.limit
        } catch (e) {
          m.error = e
          console.error(e)
          let errText = format(e)
          for (let key of Object.values(global.APIKeys || {})) {
            errText = errText.replace(new RegExp(key, 'g'), '#HIDDEN#')
          }
          m.reply(errText)
        } finally {
          if (typeof plugin.after === 'function') {
            try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
          }
          if (m.limit) conn.reply(m.chat, `Utilizaste *${m.limit}* ✿`, m)
        }

        break
      }
    }

  } catch (e) {
    console.error(e)
  } finally {
    if (opts.queque && chatUpdate?.messages?.[0]?.text) {
      const id = chatUpdate.messages[0].id || chatUpdate.messages[0].key?.id
      const i = this.msgqueque.indexOf(id)
      if (i >= 0) this.msgqueque.splice(i, 1)
    }

    let user = global.db.data.users[chatUpdate?.messages?.[0]?.sender]
    if (user) {
      user.exp += chatUpdate?.messages?.[0]?.exp || 0
      user.limit -= chatUpdate?.messages?.[0]?.limit || 0
    }

    if (!opts.noprint) {
      try {
        const { default: print } = await import('./lib/print.js')
        await print(chatUpdate.messages[0], this)
      } catch (e) {
        console.log(chatUpdate.messages[0], e)
      }
    }

    const autoreadSetting = global.db.data.settings[this.user.jid]?.autoread
    if (opts.autoread || autoreadSetting) await this.readMessages([chatUpdate.messages[0].key])
  }
}

// Fails ...
global.dfail = (type, m, conn) => {
  const fails = {
    rowner: '🔐 Solo el Creador puede usar este comando.',
    owner: '👑 Solo el Creador o subbots.',
    mods: '🛡️ Solo Mods.',
    premium: '💎 Solo Premium.',
    group: '👥 Solo en Grupos.',
    private: '🔒 Solo en privado.',
    admin: '⚔️ Solo Admins del grupo.',
    botAdmin: '🤖 Necesito ser Admin primero.',
    unreg: '☄︎ Regístrate primero con: .reg TuNombre.20'
  }
  const msg = fails[type]
  if (msg) conn.reply(m.chat, msg, m)
}


const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.greenBright("✅ Se actualizó handler.js"))
  if (global.reloadHandler) global.reloadHandler()
})