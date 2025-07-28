import { promises as fs } from 'fs'

const charactersFilePath = './database/characters.json'
const haremFilePath = './database/harem.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error('✎ No se pudo cargar el archivo *characters.json*.')
  }
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

let handler = async (m, { conn, command, args }) => {
  if (!args.length) {
    return conn.reply(m.chat, `
ꕥ Debes proporcionar el nombre de un personaje
> ● *Ejemplo ›* ${command} Roxy Migurdia
`.trim(), m)
  }

  const characterName = args.join(' ').toLowerCase().trim()

  try {
    const characters = await loadCharacters()
    const character = characters.find(c => c.name.toLowerCase() === characterName)

    if (!character) {
      return conn.reply(m.chat, `
✎ No se encontró › *${characterName}*
> ❒ Verifica que el nombre esté correcto
`.trim(), m)
    }

    if (!character.vid || !character.vid.length) {
      return conn.reply(m.chat, `
✎ No hay videos registrados para › *${character.name}*
> ❒ Intenta con otro personaje
`.trim(), m)
    }

    const randomVideo = character.vid[Math.floor(Math.random() * character.vid.length)]
    const caption = `
✩ Nombre › *${character.name}*
✿ Género › *${character.gender}*
❒ Fuente › *${character.source}*
`.trim()

    const sendAsGif = Math.random() < 0.5
    await conn.sendMessage(m.chat, {
      video: { url: randomVideo },
      gifPlayback: sendAsGif,
      caption
    }, { quoted: m })

  } catch (error) {
    await conn.reply(m.chat, `
✘ Error al cargar el video › ${error.message}
> ❒ Intenta de nuevo más tarde
`.trim(), m)
  }
}

handler.help = ['wvideo']
handler.tags = ['gacha']
handler.command = ['charvideo', 'wvideo', 'waifuvideo']
handler.group = true

export default handler