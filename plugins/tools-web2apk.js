import axios from 'axios'

class Web2Apk {
  constructor() {
    this.baseURL = 'https://standalone-app-api.appmaker.xyz'
  }

  async iniciarConstruccion(url, correo) {
    try {
      const res = await axios.post(`${this.baseURL}/webapp/build`, { url, email: correo })
      return res.data?.body?.appId
    } catch (err) {
      throw new Error('❌ Error al iniciar la construcción: ' + err.message)
    }
  }

  async configurarConstruccion(url, appID, nombreApp) {
    try {
      const logo = 'https://logo.clearbit.com/' + url.replace('https://', '')
      const config = {
        appId: appID,
        appIcon: logo,
        appName: nombreApp,
        isPaymentInProgress: false,
        enableShowToolBar: false,
        toolbarColor: '#03A9F4',
        toolbarTitleColor: '#FFFFFF',
        splashIcon: logo
      }

      const res = await axios.post(`${this.baseURL}/webapp/build/build`, config)
      return res.data
    } catch (err) {
      throw new Error('❌ Error al configurar la construcción: ' + err.message)
    }
  }

  async obtenerEstado(appID) {
    try {
      while (true) {
        const res = await axios.get(`${this.baseURL}/webapp/build/status?appId=${appID}`)
        if (res.data?.body?.status === 'success') return true
        await this.esperar(5000)
      }
    } catch (err) {
      throw new Error('❌ Error al obtener el estado: ' + err.message)
    }
  }

  async obtenerDescarga(appID) {
    try {
      const res = await axios.get(`${this.baseURL}/webapp/complete/download?appId=${appID}`)
      return res.data
    } catch (err) {
      throw new Error('❌ Error al obtener el enlace de descarga: ' + err.message)
    }
  }

  async construir(url, correo, nombreApp) {
    try {
      const appID = await this.iniciarConstruccion(url, correo)
      await this.configurarConstruccion(url, appID, nombreApp)
      await this.obtenerEstado(appID)
      const descarga = await this.obtenerDescarga(appID)
      return descarga
    } catch (err) {
      throw err
    }
  }

  async esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.web2apk = conn.web2apk || {}
  const id = m.chat

  if (!text) {
    return m.reply(`*📲 Convertidor Web ➡ APK*\n\n📌 *Uso:*\n${usedPrefix + command} <url> | <correo> | <nombre_app>\n\n💡 *Ejemplo:*\n${usedPrefix + command} https://google.com | prueba@gmail.com | Google App\n\n⏳ *El proceso puede tardar unos minutos.*`)
  }

  let [url, correo, nombreApp] = text.split('|').map(s => s.trim())

  if (!url || !correo || !nombreApp)
    return m.reply(`❌ *Formato inválido*\n\n📌 Uso correcto:\n${usedPrefix + command} <url> | <correo> | <nombre_app>`)

  if (!url.startsWith('http://') && !url.startsWith('https://'))
    url = 'https://' + url

  if (!correo.includes('@') || !correo.includes('.'))
    return m.reply('❌ *Correo inválido*. Por favor, introduce un correo válido.')

  if (id in conn.web2apk)
    return m.reply('⚠️ *Ya hay una construcción en curso*. Espera a que termine para iniciar otra.')

  try {
    conn.web2apk[id] = true
    await m.reply(`🛠️ *Iniciando construcción de APK...*\n\n🌍 *URL:* ${url}\n📧 *Correo:* ${correo}\n📱 *Nombre de la App:* ${nombreApp}`)

    const builder = new Web2Apk()
    const resultado = await builder.construir(url, correo, nombreApp)

    let enlaceDescarga = resultado?.body?.buildFile || resultado?.body?.downloadUrl || resultado?.body?.keyFile

    if (enlaceDescarga) {
      await m.reply(`✅ *Construcción finalizada con éxito*\n\n📱 *App:* ${nombreApp}\n🌐 *Sitio Web:* ${url}\n📥 *Descargar:* ${enlaceDescarga}\n\n⚠️ *Enlace válido por 24 horas*`)
    } else {
      await m.reply('❌ *No se pudo obtener el enlace de descarga*. Inténtalo nuevamente.')
    }

  } catch (err) {
    await m.reply(`❌ *Error en la construcción*\n\n📄 ${err.message}\n\n📌 Posibles causas:\n• URL inválida\n• Servidor de API fuera de servicio\n• Página web no compatible`)
  } finally {
    delete conn.web2apk[id]
  }
}

handler.help = ['web2apk']
handler.tags = ['tools']
handler.command = /^(web2apk)$/i

export default handler