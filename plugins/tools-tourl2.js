import FormData from 'form-data';
import crypto from 'crypto';
import path from 'path';

let handler = async (m, { conn }) => {
    // Check if message contains media or is quoted media
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) {
        return conn.reply(m.chat, 'Por favor enviar o citar un archivo para cargar', m);
    }

    try {
        await conn.reply(m.chat, 'Subiendo el archivo al CDN....', m);
        
        const buffer = await q.download();
        const originalFilename = q.msg?.fileName || 'file';
        
        // Upload to CDN
        const ext = path.extname(originalFilename);
        const randomFilename = crypto.randomBytes(8).toString('hex') + ext;
        const form = new FormData();
        form.append('file', buffer, { filename: randomFilename });

        const response = await Por favor enviar o citar un archivo para cargarfetch('https://upload.cifumo.xyz/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();
        
        if (!result.url) {
            return conn.reply(m.chat, 'Failed to upload file to CDN', m);
        }

        await conn.reply(m.chat, `✅ Archivo cargado exitosamente!\n🔗 URL: ${result.url}`, m);
        
    } catch (error) {
        console.error('Upload error:', error);
        conn.reply(m.chat, 'An error occurred while uploading the file', m);
    }
}

handler.help = ['tourl2'];
handler.command = ['tourl2'];
handler.tags = ['tools'];
export default handler;