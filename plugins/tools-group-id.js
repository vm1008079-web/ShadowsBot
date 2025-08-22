/* Plugin
Toplayroblox
Autor: Ado 🦖
*/
import axios from 'axios';

const handler = async (m, { conn }) => {
    try {
        m.reply('⏳ Obteniendo top juegos de Roblox...');

        const api1 = new URL('https://apis.roblox.com/explore-api/v1/get-sort-content');
        api1.search = new URLSearchParams({
            sessionId: '17996246-1290-440d-b789-d49484115b9a',
            sortId: 'top-playing-now',
            cpuCores: '8',
            maxResolution: '1920x1080',
            maxMemory: '8192',
            networkType: '4g'
        }).toString();

        const { data: json1 } = await axios.get(api1.toString());
        const listaJuegos = json1?.games?.slice(0, 10);
        if (!listaJuegos?.length) throw new Error('La lista de juegos está vacía');

        const payload = listaJuegos.map(v => ({
            type: 'GameIcon',
            targetId: v.universeId,
            format: 'png',
            size: '256x256'
        }));

        const { data: json2 } = await axios.post('https://thumbnails.roblox.com/v1/batch', payload);
        const listaThumbnails = json2.data;
        const listaCombinada = listaJuegos.map((v, i) => ({ ...v, ...listaThumbnails[i] }));

        
        const mensajes = await Promise.all(
            listaCombinada.map(async (v, i) => {
                const buffer = await axios.get(v.imageUrl, { responseType: 'arraybuffer' }).then(r => Buffer.from(r.data));
                const caption = `${i + 1} | ${v.name}\n👥 Jugadores: ${v.playerCount.toLocaleString('es-ES')}\n👍 Likes: ${(
                    (v.totalUpVotes / (v.totalUpVotes + v.totalDownVotes)) *
                    100
                ).toFixed()}%\n🎮 Jugar ahora: https://www.roblox.com/games/${v.rootPlaceId}`;
                return { url: buffer, caption };
            })
        );

        for (const msg of mensajes) {
            await conn.sendFile(m.chat, msg.url, `${msg.caption}.png`, msg.caption, m);
        }

    } catch (e) {
        m.reply(`❌ Ocurrió un error: ${e.message}`);
    }
};

handler.help = ['topplayroblox'];
handler.tags = ['tools'];
handler.command = ['topplayroblox', 'topplayrbx'];

export default handler;