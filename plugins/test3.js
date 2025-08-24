//--> Mejorado por Ado-rgb (github.com/Ado-rgb)
// •|• No quites créditos..

const questions = [
    {
        question: "a",
        options: ["b"],
        answer: "c"
    }

//let triviaSessions = new Map();

const triviaHandler = async (m, { conn, command, args, usedPrefix }) => {
    if (args.length === 0) {
        let randomIndex = Math.floor(Math.random() * questions.length);
        let questionData = questions[randomIndex];

        triviaSessions.set(m.chat, { index: randomIndex, answered: false });

        const caption = `
🎓 *d*  
        `.trim();

        const buttons = [
            {
                buttonId: `${usedPrefix}e`,
                buttonText: { displayText: `f` },
                type: 1
            },
            {
                buttonId: `${usedPrefix}g`,
                buttonText: { displayText: `h` },
                type: 1
            },
            {
                buttonId: `${usedPrefix}i`,
                buttonText: { displayText: `j` },
                type: 1
            }
        ];

        await conn.sendMessage(
            m.chat,
            {
                text: caption,
                buttons: buttons,
                viewOnce: true
            },
            { quoted: m }
        );

    } else {
        //let session = triviaSessions.get(m.chat);
        //if (!session || session.answered) {
            //return conn.reply(m.chat, `⚠️ Primero usa *${usedPrefix}trivia* para obtener una pregunta.`, m);
        }

        //let userAnswer = args[0].toUpperCase();
        //let correctAnswer = questions[session.index].answer;
        //let result = userAnswer === correctAnswer ? "🎉 ¡Respuesta correcta!" : `❌ Incorrecto. La respuesta correcta era *${questions[session.index].options[correctAnswer.charCodeAt(0) - 65]}*`;

        const caption = `
⚜️ k
`.trim();

        const buttons = [
            {
                buttonId: `${usedPrefix}menu`,
                buttonText: { displayText: "🔄 menu" },
                type: 1
            }
        ];

        await conn.sendMessage(
            m.chat,
            {
                text: caption,
                buttons: buttons,
                viewOnce: true
            },
            { quoted: m }
        );
    }
};

triviaHandler.command = /^(tes3)$/i;

export default triviaHandler;
