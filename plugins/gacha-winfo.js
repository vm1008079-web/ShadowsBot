import { promises as fs } from 'fs';

const charactersFilePath = './database/characters.json';
const haremFilePath = './database/harem.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('✎ No pudimos atrapar la información esta vez.\n> *Si crees que es un fallo, reportalo con los moderadores utilizando /report.*');
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

let handler = async (m, { conn, args }) => {
    if (args.length === 0) {
        await conn.reply(
            m.chat,
            '✎ Necesitamos un nombre para buscar la información.\n> *Ejemplo:* `#winfo Aika Sano`',
            m
        );
        return;
    }

    const characterName = args.join(' ').toLowerCase().trim();

    try {
        const characters = await loadCharacters();
        const character = characters.find(c => c.name.toLowerCase() === characterName);

        if (!character) {
            await conn.reply(
                m.chat,
                `✎ No pudimos atrapar la información esta vez.\n> *¿Seguro que existe "${characterName}"?*`,
                m
            );
            return;
        }

        const harem = await loadHarem();
        const userEntry = harem.find(entry => entry.characterId === character.id);
        const statusMessage = userEntry
            ? `Reclamado por @${userEntry.userId.split('@')[0]}`
            : 'Libre';

        const message = `╭─────────────────
│ *❀ INFO WAIFU (❛◡❛)*
├─────────────────
┃✎ *Nombre:* » *${character.name}*
┃✎ *Género:* » *${character.gender}*
┃✎ *Valor:* » *${character.value}*
┃✎ *Estado:* » ${statusMessage}
┃✎ *Fuente:* » *${character.source}*
╰─────────────────`;

        await conn.reply(m.chat, message, m, {
            mentions: userEntry ? [userEntry.userId] : []
        });
    } catch (error) {
        await conn.reply(
            m.chat,
            `✎ No pudimos atrapar la información esta vez.`,
            m
        );
    }
};

handler.help = ['winfo'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo'];
handler.group = true;
handler.register = true;

export default handler;