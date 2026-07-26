const { Replyer } = require('./wppFunctions/replyer.js');
const { Client, LocalAuth } = require('whatsapp-web.js');


const qrcode = require('qrcode-terminal');



const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', async (msg) => {
    const actions = [
        {
            //processo intermediário para identificar palavras-chave e acionar a função ping do Replyer
            keywords: ["fui roubado", "fui furtado", "fui assaltado"],
            action: () => replyer.ping(),
        }
    ];

    const message = msg.body.toLowerCase();

    const rule = actions.find(({ keywords }) =>
        keywords.some(word => message.includes(word))
    );

    if (!rule) return;

    const response = await rule.action();
    await msg.reply(response);
});

const replyer = new Replyer(client);

client.initialize();