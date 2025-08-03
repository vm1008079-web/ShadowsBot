// --> By Ado-rgb
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let prompt = text;
    let tags = 'cumbia, tropical, alegre, percusión';
    if (text.includes('|')) {
        const parts = text.split('|');
        prompt = parts[0].trim();
        tags = parts[1].trim();
    }

    if (!prompt) {
        throw `Por favor proporciona una descripción de la canción.\n\n*Ejemplo:*\n${usedPrefix + command} una canción sobre un robot solitario en el espacio | cinemática, ambiental`;
    }

    try {
        await m.reply('✍️ Paso 1/2: Generando letra de la canción...');

        const { data: lyricsResponse } = await axios.get('https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat', {
            params: {
                query: JSON.stringify([
                    {
                        role: 'system',
                        content: 'Eres una IA letrista profesional entrenada para escribir letras de canciones poéticas y rítmicas. Responde solo con letras, usando las etiquetas [verse], [chorus], [bridge], e [instrumental] o [inst] para estructurar la canción. Usa solo la etiqueta (por ejemplo, [verse]) sin numeración ni texto adicional (no escribas [verse 1], [chorus x2], etc). No agregues explicaciones, títulos u otro texto fuera de la letra. Concéntrate en imágenes vívidas, flujo emocional y ritmo fuerte. No incluyas el género ni comentarios. Responde en texto plano limpio, como si fuera una hoja de letra de canción.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]),
                link: 'writecream.com'
            }
        });

        const lyrics = lyricsResponse.response_content;
        if (!lyrics) throw new Error('No se pudo generar la letra. La IA podría estar ocupada.');

        await m.reply(`🎼 Paso 2/2: ¡Letra generada! Ahora componiendo la música con las etiquetas: *${tags}*. Esto puede tardar un minuto...`);

        const session_hash = Math.random().toString(36).substring(2);

        await axios.post('https://ace-step-ace-step.hf.space/gradio_api/queue/join?', {
            data: [240, tags, lyrics, 60, 15, 'euler', 'apg', 10, '', 0.5, 0, 3, true, false, true, '', 0, 0, false, 0.5, null, 'none'],
            event_data: null,
            fn_index: 11,
            trigger_id: 45,
            session_hash
        });

        let audioUrl;
        const maxAttempts = 60;

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(res => setTimeout(res, 2000));

            const { data: queueData } = await axios.get(`https://ace-step-ace-step.hf.space/gradio_api/queue/data?session_hash=${session_hash}`);
            const lines = queueData.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.substring(6));

                    if (d.msg === 'process_completed') {
                        if (
                            d.output &&
                            d.output.data &&
                            Array.isArray(d.output.data) &&
                            d.output.data[0] &&
                            d.output.data[0].url
                        ) {
                            audioUrl = d.output.data[0].url;
                            break;
                        } else {
                            throw new Error('El modelo terminó pero no devolvió una URL de audio válida.');
                        }
                    } else if (d.msg === 'process_failed') {
                        throw new Error('La generación de música falló en la cola.');
                    }
                }
            }

            if (audioUrl) break;
        }

        if (!audioUrl) throw new Error('La generación de música tardó demasiado. Inténtalo más tarde.');

        await conn.sendFile(m.chat, audioUrl, 'cancion_ia.wav', `*Aquí está tu canción generada con IA sobre:* "${prompt}"`, m);

    } catch (error) {
        console.error(error);
        await m.reply(`Lo siento, ocurrió un error:\n${error.message}`);
    }
};

handler.command = /^(aimusic)$/i;

export default handler;