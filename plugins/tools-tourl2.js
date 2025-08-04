import FormData from 'form-data';
import crypto from 'crypto';
import path from 'path';

let handler = async (m, { conn }) => {
    // Check si el mensaje tiene archivo o es una cita con archivo
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) {
        return conn.reply(m.chat, '📎 Por favor envía o cita un archivo para subir al CDN', m);
    }

    try {
        await conn.reply(m.chat, '⏫ Subiendo el archivo al CDN...', m);

        const buffer = await q.download();
        const originalFilename = q.msg?.fileName || 'file';
        const ext = path.extname(originalFilename);
        const randomFilename = crypto.randomBytes(8).toString('hex') + ext;

        const form = new FormData();
        form.append('file', buffer, { filename: randomFilename });

        const response = await fetch('https://upload.cifumo.xyz/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();

        if (!result.url) {
            return conn.reply(m.chat, '❌ No se pudo subir el archivo al CDN', m);
        }

        await conn.reply(m.chat, `✅ Archivo cargado exitosamente!\n🔗 URL: ${result.url}`, m);

    } catch (error) {
        console.error('❌ Error al subir:', error);
        conn.reply(m.chat, '❌ Ocurrió un error al subir el archivo', m);
    }
};

handler.help = ['tourl2'];
handler.command = ['tourl2'];
handler.tags = ['tools'];

export default handler;