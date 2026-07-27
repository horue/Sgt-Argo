import Groq from "groq-sdk";
import dotenv from "dotenv";
import Analyzer from "./analyzer.js";
dotenv.config();

export default class Replyer {
    constructor(client) {
        this.client = client;
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.analyzer = new Analyzer(client);
    }


    async buildMessageStart(content, context) {
        const answer = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: content + "A RESPOSTA DEVE SER SEMPRE EM PORTUGUÊS BRASILEIRO. Responda de forma concisa e direta, sem rodeios. Seja objetivo e claro em sua resposta. Não passe de 25 palavras. Fale de uma forma acolhedora, você está prestes a oferecer algum tipo de serviço relacionado a: " + context,
                },
            ],
            model: "openai/gpt-oss-20b",
        });

        return answer.choices[0]?.message?.content || "";
    }



    async seguro(msg) {
        try {
            const filteredMessage = await this.analyzer.filterMessage(msg);
            if (filteredMessage) {
                const response = await this.buildMessageStart("Acabei de ser roubado..." + "Ofereça algum tipo de serviço relacionado a roubo, furto ou assalto, como um seguro.", "roubo");
                return response + 'Você pode entrar em contato com nossa corretora de seguros para obter assistência imediata. Estamos aqui para ajudá-lo a lidar com essa situação e garantir que você receba o suporte necessário: ';
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