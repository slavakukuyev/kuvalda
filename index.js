require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN || '111111';

const bot = new TelegramBot(TOKEN, {
    polling: true
});

const KB = {
    picture: 'picture',
    rate: 'Currency rate',
    cat: 'Cat',
    car: 'Car',
    back: 'Back'
}

bot.onText(/\/start/, msg => {
    welcome(msg.chat.id, msg.from.username, true);
});

bot.on('message', msg => {
    switch (msg.text) {
        case KB.picture:
            sendPictures(msg.chat.id)
            break;
        case KB.rate:
            break;
        case KB.back:
            welcome(msg.chat.id, msg.from.username);
            break;
        case KB.cat:
        case KB.car:
            break;
    }
});

function sendPictures(chatId) {
    bot.sendMessage(chatId, 'Choose pictures:', {
        reply_markup: {
            keyboard: [
                [KB.car, KB.cat],
                [KB.back]
            ]
        }
    });
}

function welcome(chatId, username, start = false) {
    start = start ? ' Welcome to KUVALDA bot!' : '';
    bot.sendMessage(chatId, `Dear ${username}!${start} Please make your choice: `, {
        reply_markup: {
            keyboard: [
                [KB.picture, KB.rate]
            ]
        }
    });
}