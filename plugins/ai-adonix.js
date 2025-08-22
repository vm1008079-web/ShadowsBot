import fetch from 'node-fetch';

const handler = async (m, { text }) => {
    if (!text) return m.reply('❌ Por favor proporciona un texto para la IA.');

    try {
        const response = await fetch(`https://api.ryzendesu.vip/api/ai/claude?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error('No se pudo conectar con la API.');

        const result = await response.json();
        if (!result?.response) throw new Error('No se recibió respuesta de la API.');

        m.reply(result.response);
    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error procesando tu solicitud. Intenta de nuevo más tarde.');
    }
};

handler.help = ['claude'];
handler.tags = ['ia'];
handler.command = ['claude'];

export default handler;
