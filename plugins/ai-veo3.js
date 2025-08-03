import axios from "axios"

class SunoAPI {
  constructor() {
    this.baseURL = "https://suno.exomlapi.com"
    this.headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://suno.exomlapi.com",
      referer: "https://suno.exomlapi.com/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    }
    this.intervalo = 3000
    this.tiempoEspera = 300000
  }

  async generar({ prompt }) {
    let taskId, token
    try {
      const respuestaGeneracion = await axios.post(`${this.baseURL}/generate`, {
        prompt: prompt
      }, {
        headers: this.headers
      })
      ;({ taskId, token } = respuestaGeneracion.data)

      const tiempoInicio = Date.now()
      while (Date.now() - tiempoInicio < this.tiempoEspera) {
        await new Promise(resolve => setTimeout(resolve, this.intervalo))
        const respuestaEstado = await axios.post(`${this.baseURL}/check-status`, {
          taskId,
          token
        }, {
          headers: this.headers
        })

        if (respuestaEstado.data.results?.every(res => res.audio_url && res.image_url && res.lyrics)) {
          return respuestaEstado.data
        }
      }
      return { status: "timeout" }
    } catch (error) {
      return {
        status: "error",
        error: error.message
      }
    }
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("🔊 Por favor, ingresa una descripción (prompt)\nEjemplo para generar música con IA:\n *.suno Padre*")

  m.reply("⏳ Por favor espera... Estamos creando la canción que pediste 🎶 Generando con IA...")

  const api = new SunoAPI()
  const resultado = await api.generar({ prompt: text })

  if (resultado.status === "error") return m.reply(`❌ Ocurrió un error: ${resultado.error}`)
  if (resultado.status === "timeout") return m.reply("⚠️ Se acabó el tiempo sin recibir los resultados.")

  for (let item of resultado.results) {
    await conn.sendFile(m.chat, item.audio_url, 'audio.mp3', `🎵 Letras:\n${item.lyrics}`, m)
    await conn.sendFile(m.chat, item.image_url, 'image.jpg', '', m)
  }
}

handler.help = ['iamusic']
handler.tags = ['ai']
handler.command = ['iamusic']
export default handler