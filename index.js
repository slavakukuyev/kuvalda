require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');
const request = require('request')

const TOKEN = process.env.TOKEN || '111111';

const bot = new TelegramBot(TOKEN, {
    polling: true
});

const KB = {
    picture: 'picture',
    rate: 'Currency rate',
    btc: 'BTC',
    dollar: 'Dollar',
    back: 'Back'
}

const srcs = {
    [KB.btc]: [
        'https://ae01.alicdn.com/kf/HTB15kX_OVXXXXbeapXXq6xXFXXXR/1-x-Gold-Plated-Bitcoin-Coin-Collectible-BTC-Coin-Art-Collection-Gift-Physical.jpg_640x640.jpg',
        'https://bitcoincasinos.reviews/wp-content/uploads/2016/03/btc-coins.jpg?x29074',
        'https://www.cryptocompare.com/media/19633/btc.png?width=200'
    ],
    [KB.dollar]: [
        'http://cliparting.com/wp-content/uploads/2017/01/Free-clipart-images-dollar-sign.jpg',
        'https://thumbs.dreamstime.com/z/stacks-gold-coins-dollar-sign-16645801.jpg',
        'https://image.freepik.com/free-icon/usd-dollar-symbol_318-41744.jpg'
    ],
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
            sendCurrencyScreen(msg.chat.id);
            break;
        case KB.back:
            welcome(msg.chat.id, msg.from.username);
            break;
        case KB.btc:
        case KB.dollar:
            sendPictureByName(msg.chat.id, msg.text)
            break;
    }
});

bot.on('callback_query', query => {
    //console.log(JSON.stringify(query, null, 2))

    query.data
});

function sendCurrencyScreen(chatId) {
    bot.sendMessage(chatId, 'Choose currency: ', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: KB.btc,
                    callback_data: 'BTC'
                }]
                ,
                [{
                    text: KB.dollar,
                    callback_data: 'USD'
                }],
            ]
        }
    })
}

function sendPictureByName(chatId, picName) {
    const src = srcs[picName];
    let pasrc = src[_.random(0, src.length - 1)];

    bot.sendPhoto(chatId, pasrc);
}

function sendPictures(chatId) {
    bot.sendMessage(chatId, 'Choose pictures:', {
        reply_markup: {
            keyboard: [
                [KB.btc, KB.dollar],
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