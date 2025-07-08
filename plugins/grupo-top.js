import util from 'util'
import path from 'path'
let user = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, command, conn, text }) {
  if (!text) return conn.reply(m.chat, `📣 ¿Top de qué maje? metele algo pues\n\nEj: *${command} los más pajeros*`, m)

  let ps = groupMetadata.participants.map(v => v.id)
  let [a, b, c, d, e, f, g, h, i, j] = Array.from({ length: 10 }, () => ps.getRandom())
  let emoji = pickRandom(['🔥','💦','🍑','😈','😩','👀','🤤','💋','🤑','💀','🫦','🥵'])

  let intro = pickRandom([
    `🔥 Ey loco se armó el desmadre 🔥\nTOP 10 de ${text.toUpperCase()} directo desde el barrio 😈`,
    `💀 Este es el top más mamalón de *${text}*, y si te arde ps rascate 🍑`,
    `🫦 Científicos hondureños y doñas del mercado confirmaron este TOP 10 de ${text}`,
    `👀 Se filtró desde la pulpería el top de los más intensos en *${text}*`,
    `😈 Estos son los más malhoras en ${text}, nivel cochino sin regreso`,
    `😳 La mara votó y salió este desmadrito en *${text}*`,
    `🤤 Si no estás aquí, ni pedo... será pa la otra perro`,
  ])

  let top = `*${emoji} ${intro} ${emoji}*\n\n` +
    `*1. ${user(a)} 🔥 Este(a) ya no tiene perdón de Dios we*\n` +
    `*2. ${user(b)} 😈 Andás bien desatado(a) maje*\n` +
    `*3. ${user(c)} 💋 Este(a) anda rompiendo todo alv*\n` +
    `*4. ${user(d)} 🍑 No deja ni los buenos días*\n` +
    `*5. ${user(e)} 🥵 Le hace falta agua bendita we*\n` +
    `*6. ${user(f)} 🤤 Cada que escribe sube la temperatura*\n` +
    `*7. ${user(g)} 😩 Bien cochino(a) este loco(a)*\n` +
    `*8. ${user(h)} 👀 Calladito(a) pero bien sucio(a)*\n` +
    `*9. ${user(i)} 💀 Debería estar baneado(a) ya alv*\n` +
    `*10. ${user(j)} 🤑 Apenas y entró el vicioso(a)*`

  conn.reply(m.chat, top, m, { mentions: [a,b,c,d,e,f,g,h,i,j] })
}

handler.help = ['top *<texto>*']
handler.command = ['top']
handler.tags = ['group']
handler.group = true
handler.register = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}