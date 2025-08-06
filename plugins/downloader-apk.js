/**
 * Comando: .apk
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 * 
 * Funcionalidad:
 * 🔍 Buscar aplicaciones en Aptoide y descargarlas en formato .apk directamente desde WhatsApp
 */

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return m.reply(
      `⚡ Ingresa el nombre de la aplicación que quieres buscar\n\n` +
      `📌 Ejemplo:\n${usedPrefix + command} Facebook Lite`
    );
  }

  conn.apk = conn.apk || {};

  if (text.length <= 2 && !isNaN(text) && m.sender in conn.apk) {
    text = text.replace(/http:\/\/|https:\/\//i, "");

    let dt = conn.apk[m.sender];
    if (dt.download) return m.reply("⏳ Ya estás descargando un archivo, espera...");

    try {
      dt.download = true;

      let data = await aptoide.download(dt.data[text - 1].id);

      let caption = `
📱 Nombre: ${data.appname}
👨‍💻 Desarrollador: ${data.developer}
`.trim();

      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.img },
          caption
        },
        { quoted: m }
      );

      let dl = await conn.getFile(data.link);
      await conn.sendMessage(
        m.chat,
        {
          document: dl.data,
          fileName: data.appname + ".apk",
          mimetype: dl.mime
        },
        { quoted: m }
      );

    } catch (e) {
      console.error(e);
      m.reply("❌ Ocurrió un error al descargar el APK.");
    } finally {
      dt.download = false;
    }

  } else {
    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      return m.reply("⚠️ No se encontraron resultados para tu búsqueda.");
    }

    let caption = data
      .map((v, i) => {
        return `
${i + 1}. ${v.name}
📦 Tamaño: ${v.size}
🆚 Versión: ${v.version}
⬇️ Descargas: ${v.download}
🆔 ID: ${v.id}
`.trim();
      })
      .join("\n\n");

    let header = `💡 Para descargar, responde con: *${usedPrefix + command} 1*\n\n` +
                 `Ejemplo:\n${usedPrefix + command} 1\n\n`;

    m.reply(header + caption);

    conn.apk[m.sender] = {
      download: false,
      data,
      time: setTimeout(() => {
        delete conn.apk[m.sender];
      }, 3600000)
    };
  }
};

handler.help = ["apk"];
handler.tags = ["downloader"];
handler.command = /^(apk)$/i;
handler.register = true;

export default handler;

const aptoide = {
  search: async function (query) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=1000`
    );
    res = await res.json();

    if (!res.datalist?.list?.length) return [];

    return res.datalist.list.map((v) => ({
      name: v.name,
      size: v.size,
      version: v.file?.vername || "N/A",
      id: v.package,
      download: v.stats?.downloads || 0
    }));
  },

  download: async function (id) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`
    );
    res = await res.json();

    if (!res.datalist?.list?.length) {
      throw new Error("Aplicación no encontrada.");
    }

    const app = res.datalist.list[0];
    return {
      img: app.icon,
      developer: app.store?.name || "Desconocido",
      appname: app.name,
      link: app.file?.path
    };
  }
};