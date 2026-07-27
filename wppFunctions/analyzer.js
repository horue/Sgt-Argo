import Groq from "groq-sdk";
import dotenv from "dotenv";
import nodefs from "node:fs";
dotenv.config();

export class Analyzer {
    constructor(client) {
        this.client = client;
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.services = nodefs.readFileSync('./rules/services.txt', 'utf8');
        this.prompt = `
            Você é um classificador de intenção.

            As campanhas disponíveis são:

            ${this.services}

            Analise a conversa e responda apenas em JSON.

            Formato:

            {
                "responder": true,
                "campanha": "SEGURO",
                "confianca": 0.97
            }

            ou

            {
                "responder": false,
                "campanha": null,
                "confianca": 0.98
            }

            Conversa:
            `;
    }


    async filterMessage(content) {
        const answer = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: this.prompt + content,
                }
            ],
            model: "openai/gpt-oss-20b",
            response_format: {
                type: "json_object"
            }
        });

        const answerText = answer.choices[0]?.message?.content || "";
        console.log("Resposta do Analyzer (texto):", answerText);

        try {
            const jsonResponse = JSON.parse(answerText);
            console.log("Resposta do Analyzer:", jsonResponse);
            return jsonResponse.responder;
        }
        catch (error) {
            console.error("Erro ao analisar a resposta do Analyzer:", error);
            return false;
        }
    }

}