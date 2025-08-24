import axios from 'axios'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn }) => {
  const proses = '⚘️ Obteniendo información de los creadores...'
  await conn.sendMessage(m.chat, { text: proses }, { quoted: m })

  async function createImage(url) {
    const { imageMessage } = await generateWAMessageContent({ image: { url } }, {
      upload: conn.waUploadToServer
    })
    return imageMessage
  }

  const owners = [
    {
      name: 'Jose XrL',
      desc: 'Creador Principal de Nino Nakano Ai',
      image: 'https://iili.io/F0FyRXR.jpg',
      buttons: [
        { name: 'WhatsApp', url: 'https://wa.me/595972314588' },
        { name: 'Instagram', url: 'https://www.instagram.com/xrljose' },
        { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61556686993783' },
        { name: 'Telegram', url: 'https://t.me/JoseXrl15k' },
        { name: 'TikTok', url: 'https://www.tiktok.com/@jose.xrl15' },
        { name: 'PayPal', url: 'https://paypal.me/xrljose' }
      ]
    },
    {
      name: 'David RyZe',
      desc: 'Co-Creador de Nino Nakano Ai',
      image: 'https://iili.io/F0FyTmJ.jpg',
      buttons: [
        { name: 'WhatsApp', url: 'https://wa.me/15614809253' },
        { name: 'Instagram', url: 'https://www.instagram.com/david_zuniga17' },
        { name: 'TikTok', url: 'https://www.tiktok.com/@ryzettk' },
        { name: 'PayPal', url: 'https://paypal.me/davidryze' }
      ]
    }
  ]

  let cards = []

  for (let owner of owners) {
    const imageMsg = await createImage(owner.image)

    let formattedButtons = owner.buttons.map(btn => ({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: btn.name,
        url: btn.url
      })
    }))

    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `🪴 *${owner.name}*\n${owner.desc}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: '> Conoce más sobre nuestros creadores siguiendo sus redes sociales. Haz clic en cualquier botón para acceder a sus perfiles y descubrir su trabajo. Si te gustaría apoyarlos, también puedes realizar una donación a través de nuestro PayPal.'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage: imageMsg
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: formattedButtons
      })
    })
  }

  const slideMessage = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: '⚘️ Creadores de Nino Nakano Ai ⚘️'
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'Conoce a los desarrolladores del bot'
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
          })
        })
      }
    }
  }, {})

  await conn.relayMessage(m.chat, slideMessage.message, { messageId: slideMessage.key.id })
}

//handler.help = ['owner']
//handler.tags = ['info']
handler.command = /^(tes3)$/i

export default handler
