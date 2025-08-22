import { smsg } from './lib/simple.js'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import fs from 'fs'
import chalk from 'chalk'

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(r => setTimeout(r, ms))

function normalizeJid(jid = '') {
    return jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)

    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (!globalThis.db.data) await globalThis.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return
        globalThis.mconn = m
        m.exp = 0

        // ==== USUARIOS ====
        let user = globalThis.db.data.users[m.sender] || {}
        user.name ??= m.name
        user.coins ??= 0
        user.bank ??= 0
        user.exp ??= 0
        user.usedcommands ??= 0
        user.level ??= 0
        globalThis.db.data.users[m.sender] = user

        // ==== CHATS ====
        let chat = globalThis.db.data.chats[m.chat] || {}
        chat.welcome ??= true
        chat.nsfw ??= false
        chat.alerts ??= true
        chat.adminonly ??= false
        chat.antilinks ??= true
        chat.bannedGrupo ??= false
        chat.expired ??= 0
        chat.modoadmin ??= false
        if (!chat.antilinkWarns) chat.antilinkWarns = {}
        globalThis.db.data.chats[m.chat] = chat

        if (typeof m.text !== 'string') m.text = ''

        const isOwner = globalThis.owner.map(([num]) => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(normalizeJid(m.sender))

        // ==== LEER MENSAJES ====
        if (this.readMessages) await this.readMessages([m.key]).catch(() => {})

        m.exp += Math.ceil(Math.random() * 10)

        const groupMetadata = m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []

        const senderJid = normalizeJid(m.sender)
        const botJid = normalizeJid(this.user.jid)

        const userGroup = participants.find(u => normalizeJid(u.id) === senderJid) || {}
        const botGroup = participants.find(u => normalizeJid(u.id) === botJid) || {}

        const isAdmin = ['admin', 'superadmin'].includes(userGroup?.admin)
        const isBotAdmin = ['admin', 'superadmin'].includes(botGroup?.admin)

        // ==== VALIDACIÓN MODO ADMIN ====
        if (chat.modoadmin && m.isGroup) {
            if (!isAdmin && !isOwner && !m.fromMe) return
        }

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        // ==== COMANDOS ====
        for (const name in globalThis.plugins) {
            const plugin = globalThis.plugins[name]
            if (!plugin || plugin.disabled) continue
            const __filename = join(___dirname, name)

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, ___dirname, __filename, user, chat })
                } catch (e) {
                    console.error(chalk.bgRedBright.black(' ⚠ ERROR EN HOOK ALL ⚠ '), e.stack || e)
                }
            }

            const pluginPrefix = plugin.customPrefix || this.prefix || globalThis.prefix
            const regex = pluginPrefix instanceof RegExp ? pluginPrefix : new RegExp(`^${pluginPrefix}`)
            const match = m.text.match(regex)
            if (!match) continue

            const noPrefix = m.text.replace(match[0], '')
            let [command, ...args] = noPrefix.trim().split(/ +/)
            command = (command || '').toLowerCase()
            args = args || []
            const text = args.join(' ')

            const fail = plugin.fail || globalThis.dfail
            const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                Array.isArray(plugin.command) ? plugin.command.includes(command) :
                    plugin.command === command

            if (!isAccept) continue
            m.plugin = name

            if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
            if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
            if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }

            m.isCommand = true
            m.exp += plugin.exp ? parseInt(plugin.exp) : 10

            let extra = {
                match, usedPrefix: match[0], noPrefix, _args: args, args, command, text,
                conn: this, participants, groupMetadata, chat, isOwner, isAdmin, isBotAdmin,
                chatUpdate, ___dirname, __filename
            }

            try {
                await plugin.call(this, m, extra)
            } catch (err) {
                m.error = err
                console.error(chalk.bgRedBright.black(` ⚠ ERROR EN COMANDO: ${command} ⚠ `), err.stack || err)
            } finally {
                if (typeof plugin.after === 'function') {
                    try { await plugin.after.call(this, m, extra) }
                    catch (e) {
                        console.error(chalk.bgRedBright.black(' ⚠ ERROR EN AFTER HOOK ⚠ '), e.stack || e)
                    }
                }
            }
        }

    } catch (err) {
        console.error(chalk.bgRedBright.black(' ⚠ ERROR GENERAL HANDLER ⚠ '), err.stack || err)
    } finally {
        await (await import('./lib/print.js')).default(m, this)
    }
}

globalThis.dfail = (type, m, conn) => {
    const msg = {
        owner: `🍿 Este comando solo puede ser ejecutado por mi Creador.`,
        moderation: `🎍 El comando ${globalThis.comando} solo puede ser ejecutado por los moderadores.`,
        admin: `🧃 Este comando solo puede ser ejecutado por los Administradores del Grupo.`,
        botAdmin: `🍂 Este comando solo puede ser ejecutado si el bot es Administrador del Grupo.`
    }[type]
    if (msg) return m.reply(msg)
}