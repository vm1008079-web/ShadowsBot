import axios from 'axios';


class LunaAI {
  constructor(debug = false) {
    this.debug = debug;
    this.bypassUrl = "https://fgsi.koyeb.app/api/tools/bypasscf/v5";
    this.createUrl = "https://aiarticle.erweima.ai/api/v1/secondary-page/api/create";
    this.statusUrl = "https://aiarticle.erweima.ai/api/v1/secondary-page/api/";
    this.referer = "https://lunaai.video/";
    this.origin = "https://lunaai.video";
    this.sitekey = "0x4AAAAAAAdJZmNxW54o-Gvd";
  }

  async bypassCF(url, apikey) {
    const res = await axios.get(this.bypassUrl, {
      params: { apikey, url, sitekey: this.sitekey, mode: "turnstile-min" },
      headers: { accept: "application/json" },
    });
    return res.data?.data?.token;
  }

  async createVideo(token, payload) {
    const headers = {
      authority: "aiarticle.erweima.ai",
      "accept-language": "en-US,en;q=0.9",
      origin: this.origin,
      referer: this.referer,
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
      verify: token,
      uniqueid: btoa(Date.now()),
    };
    const res = await axios.post(this.createUrl, payload, { headers });
    return res.data?.data?.recordId;
  }

  async checkStatus(recordId) {
    const res = await axios.get(this.statusUrl + recordId, {
      headers: {
        authority: "aiarticle.erweima.ai",
        accept: "application/json",
        origin: this.origin,
        referer: this.referer,
        "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
      },
    });
    return res.data?.data;
  }

  async run({ apikey = "your apikey", prompt, imgUrls = [], quality = "720p", duration = 8 }) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.bypassCF("https://lunaai.video/features/v3-fast", apikey);
        if (!token) return reject(new Error("Bypass token failed"));
        const payload = { prompt, imgUrls, quality, duration, autoSoundFlag: false, autoSpeechFlag: false, speakerId: "Auto", aspectRatio: "16:9", secondaryPageId: 1946, channel: "VEO3", source: "lunaai.video", type: "features", watermarkFlag: false, privateFlag: false, isTemp: true, vipFlag: false, model: "veo-3-fast" };
        const recordId = await this.createVideo(token, payload);
        if (!recordId) return reject(new Error("Failed to get Record ID"));

        const interval = setInterval(async () => {
          try {
            const data = await this.checkStatus(recordId);
            if (data.state === "success" && data.completeData) {
              clearInterval(interval);
              const result = JSON.parse(data.completeData);
              resolve(result);
            } else if (data.failCode || data.failMsg) {
              clearInterval(interval);
              reject(new Error(`${data.failCode} ${data.failMsg}`));
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 5000);
      } catch (err) { reject(err); }
    });
  }
}

// PLUGIN WHATSAPP .veo
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) return m.reply(`⚠️ Uso: ${usedPrefix}veo <texto para generar video>\nEjemplo: ${usedPrefix}veo Mundo futurista con IA`);
    const prompt = args.join(" ");
    const ai = new LunaAI();
    m.reply(`⌛ Generando tu video... puede tardar un poco 🖤`);

    const result = await ai.run({ apikey: "your_apikey_aqui", prompt });
    if (!result || !result.video) return m.reply(`❌ Error al generar video 😭`);

    await conn.sendMessage(m.chat, { video: { url: result.video }, caption: `🎬 Tu video generado:\n${prompt}` }, { quoted: m });
  } catch (e) {
    console.log(e);
    m.reply(`🚨 Ocurrió un error: ${e.message}`);
  }
};

handler.help = ['veo <texto>'];
handler.tags = ['ai', 'video'];
handler.command = ['veo'];

export default handler;