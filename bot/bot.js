import Replyer from '../wppFunctions/replyer.js';
import Analyzer from '../wppFunctions/analyzer.js';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import keywords from '../presets/keywords.js';
const { Client, LocalAuth } = pkg;


export default class Bot {
    constructor() {
        this.client = new Client({
        authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
        this.qrcode = qrcode;
        
        this.replyer = new Replyer(this.client);
        this.analyzer = new Analyzer(this.client);
    }   

    initialize() {
        this.client.on('qr', (qr) => {
            this.qrcode.generate(qr, { small: true });
        });

        this.  client.on('ready', () => {
            console.log('Client is ready!');
        });

        this.client.on('message', async (msg) => {
            try {
            const actions = [
                {
                    //processo intermediário para identificar palavras-chave e acionar a função ping do Replyer
                    keywords: keywords,
                    action: () => this.replyer.reply(msg.body.toLowerCase()),
                }
            ];

            const message = msg.body.toLowerCase();

            const rule = actions.find(({ keywords }) =>
                keywords.some(word => message.includes(word))
            );

            if (!rule) return;

            const response = await rule.action();
            await msg.reply(response);}
            catch (error) {
                console.error("Erro ao processar a mensagem:", error);
                this.initialize(); // Reinicia o bot em caso de erro
            }
        });


        this.client.initialize();
    }
}