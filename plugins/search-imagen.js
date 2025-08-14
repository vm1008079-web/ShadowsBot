import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.imageSearch = conn.imageSearch || {};

  const prohibited = ['caca', 'polla', 'porno', 'porn', 'gore', 'cum', 'semen', 'puta', 'puto', 'culo', 'putita', 'putito','pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia', 'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos', 'pornhub', 'xnxx', 'xvideos', 'teta', 'vagina', 'marsha may', 'misha cross', 'sexmex', 'furry', 'furro', 'furra', 'xxx', 'rule34', 'panocha', 'pedofilia', 'necrofilia', 'pinga', 'horny', 'ass', 'nude', 'popo', 'nsfw', 'femdom', 'futanari', 'erofeet', 'sexo', 'sex', 'yuri', 'ero', 'ecchi', 'blowjob', 'anal', 'ahegao', 'pija', 'verga', 'trasero', 'violation', 'violacion', 'bdsm', 'cachonda', '+18', 'cp', 'mia marin', 'lana rhoades', 'cogiendo', 'cepesito', 'hot', 'buceta', 'xxx', 'rule', 'r u l e'];

  if (prohibited.some(word => m.text.toLowerCase().includes(word))) {
    return m.reply('Deja de buscar eso puto enfermo de mierda, por eso te encannta la paja.').then(_ => m.react('✖️'));
  }

  let query = text;
  let fromButton = false;

  if (!query) {
    if (m.sender in conn.imageSearch) {
      query = conn.imageSearch[m.sender].query;
      fromButton = true;
    } else {
      return m.reply('> Ingresa el nombre de la imágen que estas buscando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Icons`);
    }
  }

  await m.react('🕓');
  try {
    let images;
    let index;

    if (fromButton && conn.imageSearch[m.sender].query === query) {
      images = conn.imageSearch[m.sender].images;
      index = conn.imageSearch[m.sender].index + 1;
    } else {
      const { dl_url, result } = await Starlights.GoogleImage(query);
      if (!result || result.length === 0) {
        throw new Error('No se encontraron resultados.');
      }
      images = result;
      index = 0;
    }

    if (index >= images.length) {
      throw new Error('No hay más imágenes para esta búsqueda.');
    }

    const imageUrl = images[index];

    conn.imageSearch[m.sender] = {
      query: query,
      images: images,
      index: index,
      time: setTimeout(() => delete conn.imageSearch[m.sender], 60000)
    };

    const buttons = [
      {
        buttonId: `${usedPrefix + command}`,
        buttonText: { displayText: "♻️ Siguiente" },
        type: 1
      }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `*» Resultado*: ${query}\n*» Imagen*: ${index + 1}/${images.length}`,
      buttons,
      headerType: 4
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('✖️');
    await m.reply('❌ Ocurrió un error o no se encontraron más imágenes.');
    if (m.sender in conn.imageSearch) {
      delete conn.imageSearch[m.sender];
    }
  }
}

handler.help = ['imagen *<búsqueda>*']
handler.tags = ['search']
handler.command = ['image', 'gimage', 'imagen']
handler.register = false
export default handler



