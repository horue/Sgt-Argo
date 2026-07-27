const { Replyer } = require('./wppFunctions/replyer.js');
const { Analyzer } = require('./wppFunctions/analyzer.js');
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

client.on('message', async (msg) => {
    const actions = [
        {
            //processo intermediário para identificar palavras-chave e acionar a função ping do Replyer
            keywords: ["fui roubado", "fui furtado", "fui assaltado", "roubo", "furto", "assalto", "roubado", "furtado", "assaltado", "roubada", "furtada", "assaltada"],
            action: () => replyer.seguro(msg.body.toLowerCase()),
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
const analyzer = new Analyzer(client);

client.initialize();






//automação na geração de documento
//autoatendimento com agente de ia (para conseguir juntar informações vindas do site)
//agente que vasulhe a internet pesquisando sobre eventos de yoga e meditação (pela região sudeste) pela internet
//entrar em contato com o profissional host do evento e oferecer venda plataforma da atmazen


