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
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import { spawn } from 'child_process';
import { createRequire } from 'module';

// --- INICIO DE CAMBIOS: Importaciones optimizadas y Baileys ---
const { default: baileys, proto, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys');
import { makeWASocket, serialize, protoType } from './lib/simple.js';
// --- FIN DE CAMBIOS ---

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
const TMP_DIR = join(process.cwd(), 'tmp');
if (!existsSync(TMP_DIR)) {
  mkdirSync(TMP_DIR, { recursive: true });
}
process.env.TMPDIR = TMP_DIR;

import './config.js';

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };
const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

global.db = new Low(new JSONFile(`storage/databases/database.json`));

// --- INICIO DE CAMBIO PARA OPTIMIZACIÓN DE BASE DE DATOS ---
// Variable para rastrear si la base de datos ha sido modificada. Usar un "dirty flag".
global.isDatabaseModified = false;
// Función para marcar la base de datos como modificada.
global.markDatabaseModified = () => {
  global.isDatabaseModified = true;
};
// --- FIN DE CAMBIO PARA OPTIMIZACIÓN DE BASE DE DATOS ---

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) =>
      setInterval(function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000)
    );
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = false;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = lodash.chain(global.db.data);

  // --- INICIO DE CAMBIO PARA OPTIMIZACIÓN DE BASE DE DATOS ---
  // Sobrescribir los métodos de escritura de la base de datos para que marquen los cambios.
  const originalWriteMethods = {
      set: global.db.chain.set,
      // Añade otros métodos que modifican los datos si los usas (ej: push, remove)
  };
  
  global.db.chain.set = (...args) => {
    markDatabaseModified();
    return originalWriteMethods.set.apply(global.db.chain, args);
  };
  // --- FIN DE CAMBIO PARA OPTIMIZACIÓN DE BASE DE DATOS ---
};

global.authFile = `sessions`;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));
const logger = pino({ level: 'silent' }); // Nivel 'silent' para producción, 'fatal' para depuración mínima.

// --- INICIO DE CAMBIO: Opciones de conexión optimizadas ---
const connectionOptions = {
  version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnConnect: false, // Evita marcar como "en línea" al conectar
  generateHighQualityLinkPreview: false, // Reduce la carga al no generar vistas previas de alta calidad
  syncFullHistory: false, // **IMPORTANTE**: No sincronizar historial completo. Acelera la conexión.
  getMessage: async (key) => (key.remoteJid === 'status@broadcast' ? { conversation: 'Status' } : { conversation: 'Hola' }), // Stub para evitar carga innecesaria
};
// --- FIN DE CAMBIO ---

global.conn = makeWASocket(connectionOptions);
global.conns = []; // Almacenar sub-bots por JID para fácil acceso y eliminación
global.subBots = {}; // Mantener la referencia por nombre de carpeta

let handler;
try {
  const handlerModule = await import('./handler.js');
  handler = handlerModule.handler;
} catch (e) {
  console.error(chalk.red('[ERROR] No se pudo cargar el handler principal:'), e);
  process.exit(1);
}

/**
 * Función para reconectar un sub-bot y asignarle un manejador de mensajes.
 * @param {string} botPath - Ruta completa a la carpeta de sesión del sub-bot.
 */
async function reconnectSubBot(botPath) {
  const sessionName = path.basename(botPath);
  console.log(chalk.yellow(`[SUB-BOT] Intentando reconectar: ${sessionName}`));
  
  try {
    const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);

    if (!subBotState.creds.registered) {
      console.warn(chalk.yellow(`[SUB-BOT] Advertencia: La sesión en ${sessionName} no está registrada. Se omite.`));
      return;
    }

    const subBotConn = makeWASocket({
      ...connectionOptions, // Usa las mismas opciones optimizadas
      auth: {
        creds: subBotState.creds,
        keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
      },
    });

    subBotConn.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      const subBotJid = jidNormalizedUser(subBotConn.user?.id);

      if (connection === 'open') {
        console.log(chalk.green(`[SUB-BOT] 🟢 Conectado correctamente: ${sessionName} (${subBotJid})`));
        if (!global.conns.some(c => jidNormalizedUser(c.user?.id) === subBotJid)) {
            global.conns.push(subBotConn);
        }
      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.error(chalk.red(`[SUB-BOT] 🔴 Desconectado: ${sessionName}. Razón: ${reason}`));

        // --- INICIO DE CAMBIO IMPORTANTE: Manejo de desconexión permanente de Sub-Bots ---
        if ([DisconnectReason.loggedOut, 401].includes(reason)) {
          console.log(chalk.red(`[SUB-BOT] ❌ Desconexión permanente detectada. Eliminando sesión de ${sessionName}.`));
          
          // Eliminar de la lista global de conexiones
          const index = global.conns.findIndex(c => jidNormalizedUser(c.user?.id) === subBotJid);
          if (index > -1) global.conns.splice(index, 1);
          delete global.subBots[sessionName];

          // Eliminar carpeta de sesión del sistema de archivos
          try {
            rmSync(botPath, { recursive: true, force: true });
            console.log(chalk.red(`[SUB-BOT] ✅ Carpeta de sesión eliminada: ${botPath}`));
          } catch (e) {
            console.error(chalk.red(`[SUB-BOT] ❌ ERROR al eliminar la carpeta de sesión ${botPath}:`), e);
          }
        }
        // --- FIN DE CAMBIO IMPORTANTE ---
      }
    });
    subBotConn.ev.on('creds.update', saveSubBotCreds);

    subBotConn.handler = handler.bind(subBotConn);
    subBotConn.ev.on('messages.upsert', subBotConn.handler);
    
    global.subBots[sessionName] = subBotConn;
    console.log(chalk.blue(`[SUB-BOT] Manejador asignado a: ${sessionName}`));

  } catch (e) {
    console.error(chalk.red(`[SUB-BOT] Error fatal al reconectar ${sessionName}:`), e);
  }
}

/**
 * Función para iniciar la reconexión de todos los sub-bots.
 */
async function startSubBots() {
  const rutaJadiBot = join(__dirname, './JadiBots');
  if (!existsSync(rutaJadiBot)) {
    mkdirSync(rutaJadiBot, { recursive: true });
    return;
  }

  const subBotDirs = readdirSync(rutaJadiBot).filter(file => statSync(join(rutaJadiBot, file)).isDirectory());
  if (subBotDirs.length === 0) {
    console.log(chalk.gray('[SUB-BOT] No se encontraron carpetas de sub-bots.'));
    return;
  }

  console.log(chalk.magenta(`[SUB-BOT] Iniciando reconexión de ${subBotDirs.length} sub-bots...`));
  for (const dir of subBotDirs) {
    const botPath = join(rutaJadiBot, dir);
    if (existsSync(join(botPath, 'creds.json'))) {
      await reconnectSubBot(botPath);
    } else {
      console.log(chalk.yellow(`[SUB-BOT] No se encontró 'creds.json' en ${dir}, se omite.`));
    }
  }
  console.log(chalk.magenta(`[SUB-BOT] Proceso de reconexión finalizado.`));
}

await startSubBots();

// Manejo de login del bot principal (simplificado)
async function handleLogin() {
  if (conn.authState.creds.registered) {
    console.log(chalk.green('✅ Sesión principal ya registrada.'));
    return;
  }

  const usePairingCode = await question(chalk.blue('¿Desea usar código de emparejamiento? (s/n): ')).then(res => res.toLowerCase() === 's');

  if (usePairingCode) {
      let phoneNumber = await question(chalk.bgGreen('Ingresa tu número de WhatsApp (ej: 521XXXXXXXXXX): '));
      phoneNumber = phoneNumber.replace(/\D/g, '');
      try {
        if (conn.ws.readyState !== ws.OPEN) await new Promise(resolve => conn.ev.once('connection.update', ({ connection }) => connection === 'open' && resolve()));
        const code = await conn.requestPairingCode(phoneNumber);
        console.log(chalk.cyan('✨ Tu código de emparejamiento es:', code.match(/.{1,4}/g).join('-')));
      } catch (e) {
        console.error(chalk.red('❌ Error al solicitar código de emparejamiento:'), e);
      }
  } else {
    console.log(chalk.yellow('🔄 Generando código QR, por favor escanéalo...'));
    conn.ev.once('connection.update', ({ qr }) => {
      if (qr) qrcode.generate(qr, { small: true });
    });
  }
}

await handleLogin();
await loadDatabase();

conn.isInit = false;

// --- INICIO DE OPTIMIZACIÓN DE ESCRITURA Y LIMPIEZA ---
if (!opts['test']) {
  // Escribe la base de datos solo si ha habido cambios.
  setInterval(async () => {
    if (global.db.data && global.isDatabaseModified) {
      await global.db.write();
      global.isDatabaseModified = false; // Resetea la bandera después de escribir
      console.log(chalk.gray('[DB] Base de datos guardada por cambios.'));
    }
  }, 30 * 1000); // Revisa cada 30 segundos

  // Limpia la carpeta temporal de forma más agresiva.
  setInterval(() => {
    const tmpDirs = [TMP_DIR, tmpdir()];
    tmpDirs.forEach(dir => {
      try {
        readdirSync(dir).forEach(file => {
          const filePath = join(dir, file);
          const stats = statSync(filePath);
          // Elimina archivos de más de 3 minutos de antigüedad
          if (stats.isFile() && (Date.now() - stats.mtimeMs) > 180000) {
            unlinkSync(filePath);
          }
        });
      } catch (e) { /* Ignorar errores si el directorio no existe */ }
    });
  }, 3 * 60 * 1000); // Cada 3 minutos
}

// Recolector de basura manual para entornos con poca memoria.
if (global.gc) {
    setInterval(() => {
        global.gc();
        console.log(chalk.gray('[GC] Recolector de basura ejecutado.'));
    }, 5 * 60 * 1000); // Cada 5 minutos
} else {
    console.warn(chalk.yellow('[WARN] Para optimizar la memoria, ejecuta con: node --expose-gc main.js'));
}
// --- FIN DE OPTIMIZACIÓN DE ESCRITURA Y LIMPIEZA ---

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  if (isNewLogin) conn.isInit = true;

  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  
  if (connection === 'close') {
    console.error(chalk.red(`[MAIN BOT] 🔴 Conexión cerrada. Razón: ${reason} (${DisconnectReason[reason] || 'Desconocido'})`));
    // Reconexión automática para la mayoría de los errores, excepto el cierre de sesión.
    if (reason !== DisconnectReason.loggedOut) {
      await global.reloadHandler(true).catch(console.error);
    } else {
      console.error(chalk.bgRed(`[MAIN BOT] ❌ SESIÓN CERRADA. Elimina la carpeta "${global.authFile}" y escanea el QR de nuevo.`));
      process.exit(1); // Salir si la sesión es inválida
    }
  }
  if (connection === 'open') {
    console.log(chalk.green('✅ [MAIN BOT] Conectado correctamente.'));
  }
}

process.on('uncaughtException', console.error);

let isInit = true;

global.reloadHandler = async function (restartConn) {
  try {
    const HandlerModule = await import(`./handler.js?v=${Date.now()}`);
    if (HandlerModule.handler) handler = HandlerModule.handler;
  } catch (e) {
    console.error(chalk.red(`[ERROR] Fallo al recargar handler.js:`), e);
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

// Carga de plugins (sin cambios, ya es eficiente)
const pluginFolder = join(__dirname, './plugins/index');
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const module = await import(join(pluginFolder, filename));
      global.plugins[filename] = module.default || module;
    } catch (e) {
      console.error(chalk.red(`Error cargando plugin '${filename}':`), e);
      delete global.plugins[filename];
    }
  }
}
await filesInit();

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = join(pluginFolder, filename);
    if (filename in global.plugins) {
      if (existsSync(dir)) console.log(chalk.cyan(`[PLUGIN] Actualizado: '${filename}'`));
      else {
        console.warn(chalk.yellow(`[PLUGIN] Eliminado: '${filename}'`));
        return delete global.plugins[filename];
      }
    } else console.log(chalk.green(`[PLUGIN] Nuevo: '${filename}'`));
    const err = syntaxerror(readFileSync(dir), filename, { sourceType: 'module', allowAwaitOutsideFunction: true });
    if (err) console.error(chalk.red(`Error de sintaxis en '${filename}':\n${format(err)}`));
    else {
      try {
        const module = await import(`${dir}?v=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        console.error(chalk.red(`Error al requerir plugin '${filename}':\n${format(e)}`));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
