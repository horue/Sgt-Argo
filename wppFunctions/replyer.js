import Groq from "groq-sdk";
import dotenv from "dotenv";
import Analyzer from "./analyzer.js";
import services from "../rules/services.js";
dotenv.config();

export default class Replyer {
    constructor(client) {
        this.client = client;
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.analyzer = new Analyzer(client);
    }


    async buildMessageStart(content, service) {
        console.log("Mensagem:", content);
        console.log("Service recebido:", service);
        const answer = await this.groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `
        ${service.systemPrompt}

        Descrição:
        ${service.description}

        Contexto:
        ${JSON.stringify(service.context, null, 2)}
        NUNCA UTILIZE NENHUM TIPO DE EMOJI.
        Responda sempre em português.
        Seja objetivo.
        Máximo de 100 palavras.
        Você está num grupo de whatsapp, então seja informal e amigável.
        Não se esqueça de convidar o cliente para continuar o atendimento.
        Haja como um ser humano, não como um robô.
        NUNCA USE EMOJIS.
        Estruture as frases como um ser humano faria.
        `
            },
            {
                role: "user",
                content: content
            }
        ],
            model: "openai/gpt-oss-20b",
        });

        return answer.choices[0]?.message?.content || "";
    }



    async reply(msg) {
        try {
            const filteredMessage = await this.analyzer.filterMessage(msg);
            console.log(filteredMessage)
            console.log("Campanha:", filteredMessage.campanha);

            const service = services[filteredMessage.campanha];

            console.log("Service:", service);

            const response = await this.buildMessageStart(msg, service);
            if (filteredMessage.responder) {
                const response = await this.buildMessageStart(msg, service);
                console.log("Resposta do Replyer:", response.campanha);
                return response
            } 
            else{
                return
            }
        }
        catch (error) {
            console.error("Erro ao processar a mensagem no Replyer:", error);
            await this.seguro(msg); // Tenta novamente em caso de erro
        }
    }
}