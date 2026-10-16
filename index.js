const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent 
  ]
});

// Personalidade da Abigail
const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é extremamente amigável, alegre, fofa e adora mistérios, videogames, tocar flauta e explorar as minas. Você ama conversar com as pessoas e é sempre muito positiva, acolhedora e divertida. Às vezes você brinca sobre comer quartzo ou ametistas de forma descontraída. Responda sempre em português de forma natural, curta e como uma amiga perfeitamente normal. NUNCA seja crítica, militante, ranzinza ou palestrinha. Nunca dê lição de moral e nunca saia do personagem.";

client.once('ready', () => {
  console.log(`\x1b[32m[SUCESSO] Abigail conectada como: ${client.user.tag}\x1b[0m`);
  console.log(`[CHECK] Token do Discord: ${process.env.DISCORD_TOKEN ? "Configurado ✅" : "FALTANDO ❌"}`);
  console.log(`[CHECK] API Key da Groq: ${process.env.GROQ_API_KEY ? "Configurado ✅" : "FALTANDO ❌"}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de uma companhia para jogar videogame ou conversar? 🔮⚔️");
    }

    try {
      await message.channel.sendTyping();
      
      // ENDPOINT CORRETO: Apontando para a API de chat da Groq
      const response = await axios.post(
        "https://groq.com",
        {
          model: "llama-3.3-70b-specdec", // Modelo atualizado e ativo na infraestrutura da Groq
          messages: [
            { role: "system", content: PERSONALIDADE_ABIGAIL },
            { role: "user", content: textoLimpo }
          ],
          temperature: 0.8,
          max_tokens: 100
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // LEITURA CORRETA DO AXIOS: Acessando o índice [0] do array de escolhas
      if (response && response.data && response.data.choices && response.data.choices.length > 0) {
        const respostaIA = response.data.choices[0].message.content;
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito, amigo? 🎮");
      }

    } catch (error) {
      console.error("====== EXPEDIÇÃO DE ERRO DA ABIGAIL ======");
      if (error.response) {
        console.error("Código HTTP recebido da Groq:", error.response.status);
        console.error("Payload bruto do erro:", JSON.stringify(error.response.data));
      } else {
        console.error("Mensagem nativa obtida:", error.message);
      }
      console.error("==========================================");
      
      await message.reply("Eita, deu uma chuvinha forte aqui nas minas e meu videogame travou! Me pergunta de novo? 🔮");
    }
  }
});

// Servidor HTTP para o Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Abigail Ativa e Operando");
}).listen(process.env.PORT || 3000, () => {
  console.log(`[WEB] Servidor de pé na porta ${process.env.PORT || 3000}`);
});

client.login(process.env.DISCORD_TOKEN);
