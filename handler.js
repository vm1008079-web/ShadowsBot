

import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

async function normalizeToLid(jid, conn) {
  if (jid.endsWith('@lid')) return jid
  const res = await conn.onWhatsApp(jid).catch(() => [])
  return res[0]?.lid || jid
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return

    m.exp = 0
    m.coin = false

    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    global.db.data.settings[this.user.jid] = global.db.data.settings[this.user.jid] || {}

    const user = global.db.data.users[m.sender]
    const chat = global.db.data.chats[m.chat]
    const settings = global.db.data.settings[this.user.jid]

    const defaultUser = {
      exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0, health: 100,
      lastclaim: 0, lastcofre: 0, lastdiamantes: 0, lastcode: 0, lastduel: 0,
      lastpago: 0, lastmining: 0, lastcodereg: 0, muto: false, registered: false,
      genre: '', birth: '', marry: '', description: '', packstickers: null,
      name: m.name, age: -1, regTime: -1, afk: -1, afkReason: '', banned: false,
      useDocument: false, bank: 0, level: 0, role: 'Nuv', premium: false, premiumTime: 0
    }
    for (let prop in defaultUser) if (!(prop in user)) user[prop] = defaultUser[prop]

    const defaultChat = {
      isBanned: false, sAutoresponder: '', welcome: true, autolevelup: false,
      autoresponder: false, delete: false, autoAceptar: false, autoRechazar: false,
      detect: true, antiBot: false, antiBot2: false, modoadmin: false, antiLink: true,
      antifake: false, reaction: false, nsfw: false, expired: 0, antiLag: false, per: []
    }
    for (let prop in defaultChat) if (!(prop in chat)) chat[prop] = defaultChat[prop]

    const defaultSettings = { self: false, restrict: true, jadibotmd: true, antiPrivate: false, autoread: false, status: 0 }
    for (let prop in defaultSettings) if (!(prop in settings)) settings[prop] = defaultSettings[prop]
  } catch (e) {
    console.error(e)
  }

  const senderLid = await normalizeToLid(m.sender, this)
  const botLid = await normalizeToLid(this.user.jid, this)
  const senderJid = m.sender
  const botJid = this.user.jid

  const groupMetadata = m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}
  const participants = m.isGroup ? (groupMetadata.participants || []) : []
  const userInGroup = participants.find(p => p.id === senderLid || p.id === senderJid) || {}
  const botInGroup = participants.find(p => p.id === botLid || p.id === botJid) || {}

  const isRAdmin = userInGroup?.admin === 'superadmin'
  const isAdmin = isRAdmin || userInGroup?.admin === 'admin'
  const isBotAdmin = !!botInGroup?.admin

  const isROwner = global.owner.map(([n]) => n.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isOwner = isROwner || m.fromMe
  const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || user.premium

  if (m.isBaileys || opts['nyimak']) return
  if (!isROwner && opts['self']) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  if (m.isGroup) {
    const chat = global.db.data.chats[m.chat]
    if (chat?.primaryBot && this?.user?.jid !== chat.primaryBot) return
  }

  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    const queque = this.msgqueque, time = 1000 * 5
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setInterval(async () => {
      if (queque.indexOf(previousID) === -1) clearInterval(this)
      await delay(time)
    }, time)
  }

  m.exp += Math.ceil(Math.random() * 10)

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
  let usedPrefix = ''

  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    const __filename = join(___dirname, name)
    if (typeof plugin.all === 'function') {
      try {
        await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
      } catch (e) {
        console.error(e)
      }
    }

    if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let _prefix = plugin.customPrefix || this.prefix || global.prefix
    let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
      Array.isArray(_prefix) ? _prefix.map(p => {
        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
        return [re.exec(m.text), re]
      }) : typeof _prefix === 'string' ?
      [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
      [[[], new RegExp]]).find(p => p[1])

    if (typeof plugin.before === 'function') {
      if (await plugin.before.call(this, m, {
        match, conn: this, participants, groupMetadata, user: userInGroup, bot: botInGroup,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
      })) continue
    }

    if (typeof plugin !== 'function') continue

    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
      args = args || []
      let _args = noPrefix.trim().split` `.slice(1)
      let text = _args.join` `
      command = (command || '').toLowerCase()

      const isAccept = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
        plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
        typeof plugin.command === 'string' ? plugin.command === command : false

      if (!isAccept) continue

      m.plugin = name
      m.isCommand = true
      m.command = command

      if (plugin.rowner && !isROwner) return this.reply(m.chat, '🔐 Solo el Creador del Bot puede usar este comando.', m)
      if (plugin.owner && !isOwner) return this.reply(m.chat, '👑 Solo el Creador y Sub Bots pueden usar este comando.', m)
      if (plugin.mods && !isMods) return this.reply(m.chat, '🛡️ Solo los Moderadores pueden usar este comando.', m)
      if (plugin.premium && !isPrems) return this.reply(m.chat, '💎 Solo usuarios Premium pueden usar este comando.', m)
      if (plugin.group && !m.isGroup) return this.reply(m.chat, '「✧」 Este comando es sólo para grupos.', m)
      if (plugin.private && m.isGroup) return this.reply(m.chat, '🔒 Solo en Chat Privado puedes usar este comando.', m)
      if (plugin.admin && !isAdmin) return this.reply(m.chat, '⚔️ Solo los Admins del Grupo pueden usar este comando.', m)
      if (plugin.botAdmin && !isBotAdmin) return this.reply(m.chat, '🤖 El bot debe ser admin para ejecutar este comando.', m)
      if (plugin.register && !user.registered) return this.reply(m.chat, '> 🔰 Debes estar registrado para usar este comando.', m)
      if (plugin.level && user.level < plugin.level) return this.reply(m.chat, `❮✦❯ Nivel requerido: *${plugin.level}*\nTu nivel: *${user.level}*\nUsa *${usedPrefix}levelup* para subir de nivel.`, m)
      if (plugin.coin && user.coin < plugin.coin) return this.reply(m.chat, `❮✦❯ No tienes suficientes monedas (${plugin.coin}) para usar este comando.`, m)

      try {
        await plugin.call(this, m, {
          match, usedPrefix, noPrefix, _args, args, command, text,
          conn: this, participants, groupMetadata, user: userInGroup, bot: botInGroup,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate,
          __dirname: ___dirname, __filename
        })
        if (!isPrems) m.coin = plugin.coin || 0
      } catch (e) {
        m.error = e
        console.error(e)
        this.reply(m.chat, format(e), m)
      }
      break
    }
  }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Se actualizó 'handler.js'"))
})
