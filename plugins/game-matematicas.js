let partidas = {}

const handler = async (m, { conn, args }) => {
    const niveles = ['facil', 'medio', 'dificil', 'extremo']

    // Si no hay partida activa y puso nivel válido -> iniciar
    if (!partidas[m.sender] && args[0] && niveles.includes(args[0].toLowerCase())) {
        let nivel = args[0].toLowerCase()
        let num1, num2, operador, emoji, nombreOperacion, respuesta

        switch (nivel) {
            case 'facil':
                num1 = Math.floor(Math.random() * 10) + 1
                num2 = Math.floor(Math.random() * 10) + 1
                operador = ['+', '-'][Math.floor(Math.random() * 2)]
                break
            case 'medio':
                num1 = Math.floor(Math.random() * 20) + 5
                num2 = Math.floor(Math.random() * 20) + 5
                operador = ['+', '-', '*'][Math.floor(Math.random() * 3)]
                break
            case 'dificil':
                num1 = Math.floor(Math.random() * 50) + 10
                num2 = Math.floor(Math.random() * 50) + 10
                operador = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]
                break
            case 'extremo':
                num1 = Math.floor(Math.random() * 100) + 20
                num2 = Math.floor(Math.random() * 100) + 20
                operador = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]
                break
        }

        // Evitar división con decimales
        if (operador === '/') {
            num1 = num1 * num2
        }

        // Asignar emoji y nombre
        if (operador === '+') { emoji = '➕'; nombreOperacion = 'Suma' }
        if (operador === '-') { emoji = '➖'; nombreOperacion = 'Resta' }
        if (operador === '*') { emoji = '✖️'; nombreOperacion = 'Multiplicación' }
        if (operador === '/') { emoji = '➗'; nombreOperacion = 'División' }

        respuesta = eval(`${num1} ${operador} ${num2}`)

        partidas[m.sender] = {
            respuesta,
            jugador: m.sender
        }

        return conn.sendMessage(m.chat, { 
            text: `🎯 *Reto Matemático (${nivel.toUpperCase()})*\n\n${emoji} *${nombreOperacion}*\n\`${num1} ${operador} ${num2}\`\n\n✏️ Responde con:\n\`.matematicas [tu respuesta]\`\n\n⚠️ Solo ${m.pushName} puede responder`
        }, { quoted: m })
    }

    // Si hay partida y pone respuesta
    if (partidas[m.sender]) {
        if (!args[0]) return m.reply("📌 Escribe tu respuesta después de `.matematicas`")
        let intento = Number(args[0])
        if (isNaN(intento)) return m.reply("❌ Ingresa un número válido")

        let partida = partidas[m.sender]
        if (intento === partida.respuesta) {
            delete partidas[m.sender]
            return m.reply(`✅ Correcto ${m.pushName}! Era ${partida.respuesta}`)
        } else {
            delete partidas[m.sender]
            return m.reply(`❌ Incorrecto ${m.pushName}! La respuesta era ${partida.respuesta}`)
        }
    }

    // Si no pone nada válido
    return m.reply(`📚 Usa:\n\`.matematicas [nivel]\`\n\n*Niveles disponibles:*\n- fácil\n- medio\n- difícil\n- extremo\n\nEjemplo: \`.matematicas facil\``)
}


handler.command = /^matematicas$/i

export default handler