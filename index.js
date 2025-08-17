import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

console.clear()

async function animateText(text, delay = 50) {
    for (const char of text) {
        process.stdout.write(char)
        await new Promise(r => setTimeout(r, delay))
    }
    process.stdout.write('\n')
}

async function loadingAnimation() {
    const frames = ['[=     ]', '[==    ]', '[===   ]', '[====  ]', '[===== ]', '[======]']
    for (let i = 0; i < 3; i++) {
        for (const frame of frames) {
            process.stdout.write(`\r🗣️ Iniciando Michi Wa Bot ${frame}`)
            await new Promise(r => setTimeout(r, 150))
        }
    }
    console.log('\n')
}

async function showCfonts() {
    cfonts.say('✧ MICHÍ WA ✧', {
        font: 'block',
        align: 'center',
        gradient: ['cyan', 'magenta'],
        env: 'node'
    })

    cfonts.say('💎 MADE BY ADO 📍', {
        font: 'console',
        align: 'center',
        gradient: ['cyan', 'white'],
        env: 'node'
    })
}

let isWorking = false

async function launch(scripts) {
    if (isWorking) return
    isWorking = true

    await loadingAnimation()
    await animateText('🔥 Preparando scripts...')
    await showCfonts()

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