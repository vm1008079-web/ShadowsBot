// Importaciones y configuraciones iniciales (sin cambios)
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync, rmSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';
import { createRequire } from 'module';

// Mejorar la configuración de TLS y la ruta temporal
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
const tmpPath = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpPath)) {
  fs.mkdirSync(tmpPath, { recursive: true });
}
process.env.TMPDIR = tmpPath;


import './config.js';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

// Funciones globales (sin cambios)
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString(); };
global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)); };
global.__require = function require(dir = import.meta.url) { return createRequire(dir); };
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}), })) : '');
global.timestamp = { start: new Date() };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

// --- OPTIMIZACIÓN DE BASE DE DATOS ---
global.db = new Low(new JSONFile(`storage/databases/database.json`));
const saveDatabase = lodash.debounce(async () => {
    try {
        console.log(chalk.gray(`[INFO] 💾 Escribiendo cambios en la base de datos...`));
        await global.db.write();
        console.log(chalk.gray(`[INFO] ✅ Base de datos actualizada.`));
    } catch(e) {
        console.error(chalk.red('[ERROR] ❌ No se pudo escribir en la base de datos:'), e);
    }
}, 5000); // Escribe 5 segundos después del último cambio.

global.markDatabaseModified = () => saveDatabase();

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(async function () { if (!global.db.READ) { clearInterval(this); resolve(global.db.data == null ? global.loadDatabase() : global.db.data); } }, 1 * 1000));
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}), };
    global.db.chain = lodash.chain(global.db.data);

    // Modificamos 'set' para que llame a nuestra función debounced
    const originalSet = global.db.chain.set.bind(global.db.chain);
    global.db.chain.set = (...args) => {
        const result = originalSet(...args);
        global.markDatabaseModified();
        return result;
    };
};
await loadDatabase();

// --- CONFIGURACIÓN DE CONEXIÓN ---
global.authFile = `sessions`;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();
const logger = pino({ level: 'silent' }); // Nivel 'silent' para producción, 'info' para debug.

const connectionOptions = {
    version,
    logger,
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: true, // Se recomienda 'true' para que el bot aparezca en línea
    generateHighQualityLinkPreview: true,
    syncFullHistory: false, // ¡MUY IMPORTANTE PARA RENDIMIENTO!
    getMessage: async (key) => ( '' ), // Evita descargar mensajes antiguos
};

global.conn = makeWASocket(connectionOptions);
global.conns = global.conns || [];

// --- MANEJO DE PLUGINS Y HANDLER ---
let handler;
try {
    const handlerModule = await import('./handler.js');
    handler = handlerModule.handler;
} catch (e) {
    console.error(chalk.red('[ERROR] ❌ No se pudo cargar el handler principal:'), e);
    process.exit(1);
}

// --- GESTIÓN DE SUB-BOTS OPTIMIZADA ---
async function reconnectSubBot(botPath) {
    console.log(chalk.yellow(`[DEBUG] 🔄 Intentando reconectar sub-bot en: ${path.basename(botPath)}`));
    try {
        const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);

        if (!subBotState.creds.registered) {
            console.warn(chalk.yellow(`[DEBUG] ⚠️ El sub-bot en ${path.basename(botPath)} no está registrado. Saltando.`));
            return;
        }

        const subBotConn = makeWASocket({ ...connectionOptions, auth: { creds: subBotState.creds, keys: makeCacheableSignalKeyStore(subBotState.keys, logger) } });
        
        subBotConn.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(chalk.green(`[DEBUG] ✅ Sub-bot conectado: ${path.basename(botPath)}`));
                const yaExiste = global.conns.some(c => c.user?.jid === subBotConn.user?.jid);
                if (!yaExiste) global.conns.push(subBotConn);
            } else if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.error(chalk.red(`[DEBUG] ❌ Sub-bot desconectado en ${path.basename(botPath)}. Razón: ${reason}`));
                if (reason === DisconnectReason.loggedOut || reason === 401) {
                    console.log(chalk.red(`❌ Desconexión permanente. Eliminando sesión del sub-bot en ${path.basename(botPath)}.`));
                    global.conns = global.conns.filter(conn => conn.user?.jid !== subBotConn.user?.jid);
                    rmSync(botPath, { recursive: true, force: true });
                }
            }
        });
        subBotConn.ev.on('creds.update', saveSubBotCreds);
        subBotConn.handler = handler.bind(subBotConn);
        subBotConn.ev.on('messages.upsert', subBotConn.handler);
    } catch (e) {
        console.error(chalk.red(`[DEBUG] ❌ Error fatal al reconectar sub-bot en ${path.basename(botPath)}:`), e);
    }
}

async function startSubBots() {
    const rutaJadiBot = join(__dirname, './JadiBots');
    if (!existsSync(rutaJadiBot)) mkdirSync(rutaJadiBot, { recursive: true });

    const subBotDirs = readdirSync(rutaJadiBot).filter(file => statSync(join(rutaJadiBot, file)).isDirectory());
    if (subBotDirs.length === 0) {
        console.log(chalk.gray(`[DEBUG] 🚫 No se encontraron carpetas de sub-bots.`));
        return;
    }

    console.log(chalk.magenta(`[DEBUG] 🚀 Iniciando conexión de ${subBotDirs.length} sub-bot(s) en paralelo...`));
    const connectionPromises = subBotDirs.map(dir => {
        const botPath = join(rutaJadiBot, dir);
        if (existsSync(join(botPath, 'creds.json'))) {
            return reconnectSubBot(botPath);
        }
        return Promise.resolve();
    });
    await Promise.allSettled(connectionPromises);
    console.log(chalk.magenta(`[DEBUG] ✅ Proceso de reconexión de sub-bots finalizado.`));
}

await startSubBots();


// --- MANEJO DE LOGIN ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

async function handleLogin() {
    if (conn.authState.creds.registered) return;
    
    let phoneNumber;
    const usePairingCode = await question(chalk.white(`✨ ¿Deseas usar un código de emparejamiento? (s/n) `));
    
    if (usePairingCode.toLowerCase().trim() === 's') {
        phoneNumber = await question(chalk.yellow('🌤️ Ingresa tu número de WhatsApp (incluye código país, ej: 521XXXXXXXXXX):\n'));
        phoneNumber = phoneNumber.replace(/\D/g, '');

        if (!phoneNumber) {
            console.log(chalk.red('❌ Número de teléfono inválido.'));
            return handleLogin();
        }

        try {
            const code = await conn.requestPairingCode(phoneNumber);
            console.log(chalk.cyan('\n✨ Tu código de emparejamiento es:', code.match(/.{1,4}/g).join('-')));
        } catch (e) {
            console.log(chalk.red('❌ Error al solicitar código:'), e.message);
        }
    } else {
        console.log(chalk.yellow('\n⏳ Generando código QR, escanéalo con tu WhatsApp...'));
        conn.ev.on('connection.update', ({ qr }) => {
            if (qr) qrcode.generate(qr, { small: true });
        });
    }
}
await handleLogin();

// --- TAREAS PERIÓDICAS OPTIMIZADAS ---
function clearTmp() {
    const tmpDir = join(__dirname, './tmp');
    if (!existsSync(tmpDir)) return;
    const files = readdirSync(tmpDir);
    let filesDeleted = 0;
    for (const file of files) {
        try {
            const filePath = join(tmpDir, file);
            const stats = statSync(filePath);
            if (stats.isFile() && (Date.now() - stats.mtimeMs >= 5 * 60 * 1000)) { // 5 minutos
                unlinkSync(filePath);
                filesDeleted++;
            }
        } catch (e) { console.error(chalk.red(`[ERROR] ❌ No se pudo limpiar ${file}: ${e.message}`)); }
    }
    if (filesDeleted > 0) console.log(chalk.gray(`[INFO] 🗑️ Se eliminaron ${filesDeleted} archivos temporales.`));
}

setInterval(clearTmp, 180000); // Cada 3 minutos

if (typeof global.gc === 'function') {
    setInterval(() => {
        global.gc();
        console.log(chalk.gray(`[INFO] ♻️ Recolección de basura ejecutada.`));
    }, 180000); // Cada 3 minutos
}

// --- MANEJO DE CONEXIÓN PRINCIPAL ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
        console.log(chalk.green('✅ Bot principal conectado correctamente.'));
    }
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        const shouldReconnect = reason !== DisconnectReason.loggedOut;
        console.log(chalk.yellow(`🔌 Conexión cerrada. Razón: ${reason}. ${shouldReconnect ? 'Intentando reconectar...' : 'Desconexión permanente.'}`));
        if (shouldReconnect) {
            setTimeout(() => global.reloadHandler(true).catch(console.error), 5000);
        } else {
            console.log(chalk.red(`❌ Sesión cerrada. Elimina la carpeta '${global.authFile}' y escanea nuevamente.`));
            // Si usas PM2 o un gestor de procesos, podrías reiniciarlo aquí
            // process.exit(1);
        }
    }
}

// --- RECARGA DE HANDLERS Y PLUGINS ---
process.on('uncaughtException', console.error);
let isInit = true;

global.reloadHandler = async function (restartConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`);
        if (Handler.handler) handler = Handler.handler;
    } catch (e) {
        console.error(e);
    }
    if (restartConn) {
        try {
            if (global.conn.ws) global.conn.ws.close();
        } catch {}
        global.conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
    }
    conn.handler = handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds.bind(global.conn, true);
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    isInit = false;
    return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
    const files = readdirSync(pluginFolder).filter(pluginFilter);
    const promises = files.map(async (filename) => {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(`[ERROR] ❌ Error al cargar plugin '${filename}': ${e}`);
            delete global.plugins[filename];
        }
    });
    await Promise.all(promises);
}
await filesInit();

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(`[INFO] 🔄 Plugin actualizado - '${filename}'`);
            else {
                conn.logger.warn(`[WARN] 🗑️ Plugin eliminado - '${filename}'`);
                return delete global.plugins[filename];
            }
        } else conn.logger.info(`[INFO] ✨ Nuevo plugin - '${filename}'`);
        const err = syntaxerror(readFileSync(dir), filename, { sourceType: 'module', allowAwaitOutsideFunction: true });
        if (err) conn.logger.error(`[ERROR] ❌ Error de sintaxis en '${filename}':\n${format(err)}`);
        else try {
            const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(`[ERROR] ❌ Error al requerir '${filename}':\n${format(e)}`);
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
    }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();