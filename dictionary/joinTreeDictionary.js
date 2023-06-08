module.exports = (lang, name) => {

    const notification = {
        "uk": {
            "title": "Приєднання до дерева",
            "body": `${name} приєднався до вашого дерева.`
        },
        "ru": {
            "title": "Присоединение к дереву",
            "body": `${name} присоединился к вашему дереву.`
        },
        "en": {
            "title": "Joining the tree",
            "body": `${name} has joined to your tree.`
        }
    };

    return notification[lang];
}

