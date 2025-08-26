import speed from "performance-now";
import { exec } from "child_process";
import pkg from '@whiskeysockets/baileys'
const { proto, generateWAMessageFromContent } = pkg

let handler = async (m, { conn }) => {
  let timestamp = speed();

  exec(`neofetch --stdout`, async (error, stdout, stderr) => {
    let latensi = speed() - timestamp;
    let child = stdout.toString("utf-8");
    let ssd = child.replace(/Memory:/, "Ram:");

    const textMsg = `${ssd}\n乂  *Speed* : ${latensi.toFixed(4)} _ms_`

    const buttonsMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: textMsg
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '📊 Información del sistema'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: 'SPEED TEST',
              hasMediaAttachment: false
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '⚡ Ver velocidad',
                    id: '.speed'
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📊 Info',
                    id: '.ping'
                  })
                }
              ]
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(m.chat, buttonsMessage.message, { messageId: buttonsMessage.key.id })
  });
};

handler.help = ["ping"];
handler.tags = ["info"];
handler.command = ["ping", "p"];

export default handler;