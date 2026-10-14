const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre e adora mistérios, videogames, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas porque as pessoas dizem que você faz isso. Responda sempre em português de forma natural, curta, descontraída e como uma pessoa perfeitamente normal. Nunca seja crítica, militante ou ranzinza. Nunca saia do personagem.";

// ALERTA DE DIAGNÓSTICO: Mostra no console do Render se as chaves existem
client.once('ready', () => {
  console.log(`[BOT] Conectado com sucesso como: ${client.user.tag}`);
  console.log(`[CHECK] Token do Discord configurado: ${process.env.DISCORD_TOKEN ? "SIM" : "NÃO"}`);
  console.log(`[CHECK] API Key da Groq configurada: ${process.env.GROQ_API_KEY ? "SIM" : "NÃO"}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();

    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de algo? 🔮⚔️");
    }

    try {
      await message.channel.sendTyping();

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant", 
          messages: [
            { role: "system", content: PERSONALIDADE_ABIGAIL },
            { role: "user", content: textoLimpo }
          ],
          temperature: 0.7,
          max_tokens: 100
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // SINTAXE BLINDADA: Evita qualquer quebra de leitura de objeto usando '?.'
      const respostaIA = response?.data?.choices?.[0]?.message?.content;

      if (respostaIA) {
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }

    } catch (error) {
      // PRINT CRUCIAL: Mostra o exato motivo da falha no terminal do Render
      console.error("====== DETALHES DO ERRO REAL ======");
      if (error.response) {
        console.error("Status do Erro:", error.response.status);
        console.error("Dados do Erro:", JSON.stringify(error.response.data));
      } else {
        console.error("Mensagem do Erro:", error.message);
      }
      console.error("===================================");
      
      await message.reply("Eita, deu uma chuvinha forte aqui e meu videogame travou! Me pergunta de novo? 🔮");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Abigail Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
