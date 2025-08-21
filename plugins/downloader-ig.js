import axios from "axios";
import * as cheerio from "cheerio";
import qs from "qs";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(`• *Ejemplo*: ${usedPrefix + command} *[URL de Instagram]*`);
    if (!text.includes('instagram.com')) return m.reply(`• *Ejemplo*: ${usedPrefix + command} *[URL de Instagram]*`);

    m.reply("Aguarda un momento...");
    try {
        const resultado = await Instagram(text);
        if (!resultado.url || resultado.url.length === 0) return m.reply("*No se encontró ningún archivo multimedia.*");

        const urls = resultado.url;
        const metadata = resultado.metadata;

        const caption = `*I N S T A G R A M - D O W N L O A D E R*

   *🪴 Título:* ${metadata.caption}
   *⛅ Autor:* ${metadata.username}
   *🍿 Tipo:* ${metadata.isVideo ? "Video" : "Foto"}
   *🧃 Me gusta:* ${formatoNumeroCorto(metadata.like)}
   *🥞 Comentarios:* ${formatoNumeroCorto(metadata.comment)}`.trim();

        for (const mediaUrl of urls) {
            await conn.sendFile(m.chat, mediaUrl, "", caption, m);
        }
    } catch (error) {
        m.reply("Ocurrió un error. Intenta más tarde.");
    }
};

handler.help = ["ig", "instagram"];
handler.tags = ["descargas"];
handler.command = ["ig", "instagram"];

export default handler;

function formatoNumeroCorto(numero) {
    if (numero >= 1e6) {
        return (numero / 1e6).toFixed(1) + "M";
    } else if (numero >= 1e3) {
        return (numero / 1e3).toFixed(1) + "K";
    }
    return numero.toString();
}

const obtenerLinksDescarga = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!url.match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/) && !url.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)) {
                return reject({ msg: "URL inválida" });
            }

            function decodificarDatos(data) {
                let [parte1, parte2, parte3, parte4, parte5, parte6] = data;

                function decodificarSegmento(segmento, base, longitud) {
                    const charSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
                    let baseSet = charSet.slice(0, base);
                    let decodeSet = charSet.slice(0, longitud);

                    let valor = segmento.split("").reverse().reduce((acum, char, index) => {
                        if (baseSet.indexOf(char) !== -1) {
                            return acum += baseSet.indexOf(char) * Math.pow(base, index);
                        }
                    }, 0);

                    let resultado = "";
                    while (valor > 0) {
                        resultado = decodeSet[valor % longitud] + resultado;
                        valor = Math.floor(valor / longitud);
                    }

                    return resultado || "0";
                }

                parte6 = "";
                for (let i = 0, len = parte1.length; i < len; i++) {
                    let segmento = "";
                    while (parte1[i] !== parte3[parte5]) {
                        segmento += parte1[i];
                        i++;
                    }

                    for (let j = 0; j < parte3.length; j++) {
                        segmento = segmento.replace(new RegExp(parte3[j], "g"), j.toString());
                    }
                    parte6 += String.fromCharCode(decodificarSegmento(segmento, parte5, 10) - parte4);
                }
                return decodeURIComponent(encodeURIComponent(parte6));
            }

            function extraerParametros(data) {
                return data.split("decodeURIComponent(escape(r))}(")[1].split("))")[0].split(",").map(item => item.replace(/"/g, "").trim());
            }

            function extraerLinkDescarga(data) {
                return data.split("getElementById(\"download-section\").innerHTML = \"")[1].split("\"; document.getElementById(\"inputData\").remove(); ")[0].replace(/\\(\\)?/g, "");
            }

            function obtenerUrlVideo(data) {
                return extraerLinkDescarga(decodificarDatos(extraerParametros(data)));
            }

            const response = await axios.post("https://snapsave.app/action.php?lang=id", "url=" + url, {
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    origin: "https://snapsave.app",
                    referer: "https://snapsave.app/id",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
                }
            });

            const data = response.data;
            const contenidoPagina = obtenerUrlVideo(data);
            const $ = cheerio.load(contenidoPagina);
            const linksDescarga = [];

            $("div.download-items__thumb").each((index, item) => {
                $("div.download-items__btn").each((btnIndex, button) => {
                    let urlDescarga = $(button).find("a").attr("href");
                    if (!/https?:\/\//.test(urlDescarga || "")) {
                        urlDescarga = "https://snapsave.app" + urlDescarga;
                    }
                    linksDescarga.push(urlDescarga);
                });
            });

            if (!linksDescarga.length) {
                return reject({ msg: "No se encontró información" });
            }

            return resolve({
                url: linksDescarga,
                metadata: {
                    url: url
                }
            });
        } catch (error) {
            return reject({ msg: error.message });
        }
    });
};

const CABECERAS = {
    Accept: "*/*",
    "Accept-Language": "es-ES,es;q=0.5",
    "Content-Type": "application/x-www-form-urlencoded",
    "X-FB-Friendly-Name": "PolarisPostActionLoadPostQueryQuery",
    "X-CSRFToken": "RVDUooU5MYsBbS1CNN3CzVAuEP8oHB52",
    "X-IG-App-ID": "1217981644879628",
    "X-FB-LSD": "AVqbxe3J_YA",
    "X-ASBD-ID": "129477",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
};

function obtenerIdPostInstagram(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|tv|stories|reel)\/([^/?#&]+).*/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function codificarDatosGraphql(shortcode) {
    const requestData = {
        // (igual que en inglés, solo cambian nombres de funciones)
        av: "0",
        __d: "www",
        __user: "0",
        __a: "1",
        // ... resto igual
        variables: JSON.stringify({
            shortcode: shortcode,
            fetch_comment_count: null,
            fetch_related_profile_media_count: null,
            parent_comment_count: null,
            child_comment_count: null,
            fetch_like_count: null,
            fetch_tagged_user_count: null,
            fetch_preview_comment_count: null,
            has_threaded_comments: false,
            hoisted_comment_id: null,
            hoisted_reply_id: null,
        }),
        server_timestamps: "true",
        doc_id: "10015901848480474",
    };

    return qs.stringify(requestData);
}

async function obtenerDatosGraphql(postId, proxy) {
    try {
        const encodedData = codificarDatosGraphql(postId);
        const response = await axios.post("https://www.instagram.com/api/graphql", encodedData, { headers: CABECERAS, httpsAgent: proxy });
        return response.data;
    } catch (error) {
        throw error;
    }
}

function extraerInfoPost(mediaData) {
    try {
        const obtenerUrls = (data) => {
            if (data.edge_sidecar_to_children) {
                return data.edge_sidecar_to_children.edges.map((edge) => edge.node.video_url || edge.node.display_url);
            }
            return data.video_url ? [data.video_url] : [data.display_url];
        };

        return {
            url: obtenerUrls(mediaData),
            metadata: {
                caption: mediaData.edge_media_to_caption.edges[0]?.node.text || null,
                username: mediaData.owner.username,
                like: mediaData.edge_media_preview_like.count,
                comment: mediaData.edge_media_to_comment.count,
                isVideo: mediaData.is_video,
            }
        };
    } catch (error) {
        throw error;
    }
}

async function ig(url, proxy = null) {
    const postId = obtenerIdPostInstagram(url);
    if (!postId) {
        throw new Error("URL de Instagram inválida");
    }
    const data = await obtenerDatosGraphql(postId, proxy);
    const mediaData = data.data?.xdt_shortcode_media;
    return extraerInfoPost(mediaData);
}

async function Instagram(url) {
    let resultado = "";
    try {
        resultado = await ig(url);
    } catch (e) {
        try {
            resultado = await obtenerLinksDescarga(url);
        } catch (e) {
            resultado = {
                msg: "Intenta de nuevo más tarde"
            };
        }
    }
    return resultado;
}