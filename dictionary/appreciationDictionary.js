module.exports = (lang, name) => {

    const notification = {
        "uk": {
            "title": "Вас відмітили",
            "body": `😊 ${name} вас відмитив(лa) в своєму щоденнику вдячності.`
        },
        "ru": {
            "title": "Вас отметили",
            "body": `😊 ${name} вас отметил(а) в своём дневнике благодарности.`
        },
        "en": {
            "title": "You were tagged",
            "body": `😊 ${name} has written about you in her gratitude diary.`
        }
    };

    return notification[lang];
}

