import { watchFile, unwatchFile } from 'fs'
import { spawn } from 'child_process'

let child

function start() {
    if (child) child.kill() 

    console.clear()
    console.log('✨ Michi-WaBot ✨\n')

    child = spawn('node', ['main.js'], { stdio: 'inherit' })

    child.on('exit', (code) => {
        console.log(`⚠️ Proceso terminado con código ${code}`)
    })
}


watchFile('main.js', () => {
    unwatchFile('main.js')
    console.log('\n🔄 main.js actualizado, reiniciando...\n')
    start()
})

// Inicia por primera vez
start()