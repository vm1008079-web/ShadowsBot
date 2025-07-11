import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import fetch from 'node-fetch'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const name2 = await conn.getName(m.sender)
  const userId = m.sender

  if (user.registered === true) {
    return m.reply(
`✩*⢄⢁✧ --------- ✧⡈⡠*✩
❐ Ya estás registrado

¿Quieres volver a registrarte?
➩ Usa: *${usedPrefix}unreg*`)
  }

  if (!Reg.test(text)) {
    return m.reply(
`✩*⢄⢁✧ --------- ✧⡈⡠*✩
❐ Formato incorrecto

➩ Usa: *${usedPrefix + command} nombre.edad*
➩ Ejemplo: *${usedPrefix + command} ${name2}.18*`)
  }

  let [_, name, splitter, age] = text.match(Reg)

  if (!name) return m.reply('➩✧ El nombre no puede estar vacío ❐')
  if (!age) return m.reply('➩✧ La edad no puede estar vacía ❐')
  if (name.length >= 100) return m.reply('➩✧ El nombre es demasiado largo ❐')

  age = parseInt(age)
  if (isNaN(age)) return m.reply('➩✧ Edad inválida ❐')
  if (age > 1000) return m.reply('➩✧ Wow, el abuelo quiere usar el bot 💀')
  if (age < 5) return m.reply('➩✧ Hay un bebé queriendo jugar jsjs 👶')

  // Guardar datos
  user.name = name + '✓'
  user.age = age
  user.regTime = +new Date()
  user.registered = true
  user.coin += 40
  user.exp += 300
  user.joincount += 20

  const fecha = new Date(user.regTime)
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')

  const regbot = 
`✩*⢄⢁✧ --------- ✧⡈⡠*✩
   ✧ Registro exitoso ✧
➥ Nombre: *${name}*
➥ Edad: *${age}*
➥ ID: *${userId.split('@')[0]}*
➥ Fecha: *${fecha.toLocaleDateString()}*`

  await m.react('📩')

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: regbot
  }, { quoted: m })
}

handler.help = ['reg']
handler.tags = ['eco']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler