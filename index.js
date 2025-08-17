import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import readline from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

console.clear()

async function typeText(text, delay = 40) {
    for (const char of text) {
        process.stdout.write(char)
        await new Promise(r => setTimeout(r, delay))
    }
    process.stdout.write('\n')
}

async function flashyLoading() {
    const frames = ['[=     ]', '[==    ]', '[===   ]', '[====  ]', '[===== ]', '[======]']
    for (let i = 0; i < 4; i++) {
        for (const frame of frames) {
            const color = ['\x1b[36m', '\x1b[35m', '\x1b[33m', '\x1b[32m'][i % 4]
            process.stdout.write(`\r${color}🗣️ Iniciando Michi Wa Bot ${frame}\x1b[0m`)
            await new Promise(r => setTimeout(r, 120))
        }
    }
    console.log('\n')
}

async function blinkCfonts() {
    const gradients = [
        ['cyan', 'magenta'],
        ['yellow', 'red'],
        ['green', 'white'],
        ['blue', 'magenta']
    ]
    for (let i = 0; i < 4; i++) {
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
        await new Promise(r => setTimeout(r, 600))
        console.clear()
    }
    await flashyLoading()
}

let isWorking = false

async function launch(scripts) {
    if (isWorking) return
    isWorking = true

    await typeText('🔥 Preparando scripts...')
    await blinkCfonts()

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