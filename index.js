require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');
const request = require('request');
const API_URL = 'https://api.bitfinex.com/v1';

const loki = require('lokijs');
const DB = new loki('loki.json', { persistenceMethod: 'fs', autosave: true });
const srcs = DB.addCollection('srcs');


const TOKEN = process.env.TOKEN || 'yourValidToken';

const bot = new TelegramBot(TOKEN, {
    polling: true
});

var symbols_btns;

const KB = {
    picture: 'picture',
    rate: 'Currency rate',
    btc: 'BTC',
    dollar: 'Dollar',
    back: 'Back'
};

function saveSRCS_onload() {
    srcs.insert({key: KB.btc, urls: [
        'https://ae01.alicdn.com/kf/HTB15kX_OVXXXXbeapXXq6xXFXXXR/1-x-Gold-Plated-Bitcoin-Coin-Collectible-BTC-Coin-Art-Collection-Gift-Physical.jpg_640x640.jpg',
        'https://bitcoincasinos.reviews/wp-content/uploads/2016/03/btc-coins.jpg?x29074',
        'https://www.cryptocompare.com/media/19633/btc.png?width=200'
    ]})

    srcs.insert({key: KB.dollar, urls: [
        'http://cliparting.com/wp-content/uploads/2017/01/Free-clipart-images-dollar-sign.jpg',
        'https://thumbs.dreamstime.com/z/stacks-gold-coins-dollar-sign-16645801.jpg',
        'https://image.freepik.com/free-icon/usd-dollar-symbol_318-41744.jpg'
    ]})

    console.log('srcs have been inserted successfully')

}

/* const srcs1 = {
    ['btc']: [
        'https://ae01.alicdn.com/kf/HTB15kX_OVXXXXbeapXXq6xXFXXXR/1-x-Gold-Plated-Bitcoin-Coin-Collectible-BTC-Coin-Art-Collection-Gift-Physical.jpg_640x640.jpg',
        'https://bitcoincasinos.reviews/wp-content/uploads/2016/03/btc-coins.jpg?x29074',
        'https://www.cryptocompare.com/media/19633/btc.png?width=200'
    ],
    [KB.dollar]: [
        'http://cliparting.com/wp-content/uploads/2017/01/Free-clipart-images-dollar-sign.jpg',
        'https://thumbs.dreamstime.com/z/stacks-gold-coins-dollar-sign-16645801.jpg',
        'https://image.freepik.com/free-icon/usd-dollar-symbol_318-41744.jpg'
    ],
    [KB.video]: [
        'https://www.youtube.com/watch?v=Um63OQz3bjo'
    ]
} */

bot.onText(/\/start/, msg => {
    welcome(msg.chat.id, msg.from.username, true);
});

bot.on('message', msg => {
    switch (msg.text) {
        case KB.picture:
            sendPictures(msg.chat.id)
            break;
        case KB.rate:
            sendCurrencyToConvert(msg.chat.id);
            break;
        case KB.back:
            welcome(msg.chat.id, msg.from.username);
            break;
        case KB.btc:
        case KB.dollar:
            sendPictureByName(msg.chat.id, msg.text)
            break;
       /*  case KB.video:
            sendVideo(msg.chat.id)
            break; */
    }
});

bot.on('callback_query', query => {
    request(API_URL + '/pubticker/' + query.data,
        (err, res, body) => {
            if (err) {
                throw new Error(err);
            }

            //console.log('rate for ' + query.data + ': ', body);

            if (res.statusCode === 200) {
                const rates = JSON.parse(body);
                const html = `Rate for ${query.data.toUpperCase()} <b>Hight:  ${rates.high} </b>`;

                bot.sendMessage(query.message.chat.id, html, {
                    parse_mode: 'HTML'
                });
            }
        }
    );
});

function sendCurrencyToConvert(chatId, from_to = 'FROM') {
    bot.sendMessage(chatId, 'Choose currency to convert ' + from_to + ': ', {
        reply_markup: {
            inline_keyboard: symbols_btns
        }
    });
}

function sendPictureByName(chatId, picName) {
    const src = srcs.find({key: picName})[0]['urls'];
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

function get_rate_symbols() {
    request(API_URL + '/symbols',
        (err, res, body) => {
            if (err) {
                throw new Error(err);
            }
            //console.log('loading symbols: ', body);
            if (res.statusCode === 200) {
                const symbols = JSON.parse(body);
                if (symbols && symbols.length) {
                    symbols_btns = symbols.map(symbol => (
                        [{
                            text: symbol.toUpperCase(),
                            callback_data: symbol
                        }]
                    ));

                    console.log('symbols loaded successfully');
                }
            }
        }
    )
}


saveSRCS_onload();
get_rate_symbols();

console.log('work started...');
