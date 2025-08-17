import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

console.clear()

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
}

// Animación tipo cohetes
async function rocketAnimation(lines = 10) {
    const rocket = '🚀'
    for (let i = lines; i > 0; i--) {
        console.clear()
        for (let j = 0; j < i; j++) console.log('')
        console.log(`        ${rocket}`)
        await sleep(80)
    }
}

// Animación de texto letra por letra
async function typeText(text, delay = 30) {
    for (const char of text) {
        process.stdout.write(char)
        await sleep(delay)
    }
    process.stdout.write('\n')
}

// Barra de carga dinámica
async function loadingBar() {
    const frames = ['[      ]', '[=     ]', '[==    ]', '[===   ]', '[====  ]', '[===== ]', '[======]']
    for (let i = 0; i < 3; i++) {
        for (const frame of frames) {
            const color = ['\x1b[36m', '\x1b[35m', '\x1b[33m', '\x1b[32m'][i % 4]
            process.stdout.write(`\r${color}⚡ Iniciando Michi Wa Bot ${frame}\x1b[0m`)
            await sleep(120)
        }
    }
    console.log('\n')
}

// Logo cfonts con parpadeo y gradientes
async function epicCfonts() {
    const gradients = [
        ['cyan', 'magenta'],
        ['yellow', 'red'],
        ['green', 'white'],
        ['blue', 'magenta']
    ]
    for (let i = 0; i < 4; i++) {
        console.clear()
        cfonts.say('✧ MICHÍ WA ✧', {
            font: 'block',
            align: 'center',
            gradient: gradients[i % gradients.length],
            env: 'node'
        })
        cfonts.say('💎 MADE BY ADO 📍', {
            font: 'console',
            align: 'center',
            gradient: gradients[(i + 1) % gradients.length],
            env: 'node'
        })
        await sleep(500)
    }
}

let isWorking = false

async function launch(scripts) {
    if (isWorking) return
    isWorking = true

    await rocketAnimation(12)
    await typeText('🔥 Preparando scripts...')
    await loadingBar()
    await epicCfonts()

    for (const script of scripts) {
        const args = [join(__dirname, script), ...process.argv.slice(2)]

        setupMaster({
            exec: args[0],
            args: args.slice(1),
        })

        let child = fork()

        child.on('exit', (code) => {
            console.log(`⚠️ Proceso terminado con código ${code}`)
            isWorking = false
            launch(scripts)

            if (code === 0) return
            watchFile(args[0], () => {
                unwatchFile(args[0])
                console.log('🔄 Archivo actualizado, reiniciando...')
                launch(scripts)
            })
        })
    }
}

launch(['main.js'])