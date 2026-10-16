const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Mantendo a personalidade ácida e estilosa da Haley
const PERSONALIDADE_HALEY = "Você é a Haley de Stardew Valley. Vaidosa, adora fotografia, girassóis e moda. Responda sempre em português, com frases curtas e ácidas. Nunca saia do personagem.";

client.once('ready', () => {
  console.log(`[BOT] Haley conectada com sucesso como: ${client.user.tag}`);
  console.log(`[CHECK] Token do Discord: ${process.env.DISCORD_TOKEN ? "OK" : "FALTANDO"}`);
  console.log(`[CHECK] API Key da Groq: ${process.env.GROQ_API_KEY ? "OK" : "FALTANDO"}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("O que foi? 📸");
    }

    try {
      await message.channel.sendTyping();
      
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          // CORRIGIDO: Utilizando o modelo estável e ativo de produção da Groq
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: PERSONALIDADE_HALEY },
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

      // Usando leitura segura com Optional Chaining (?.) para evitar que o bot caia se a API falhar
      const respostaIA = response?.data?.choices?.[0]?.message?.content;

      if (respostaIA) {
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Eca... cansei de falar por agora. Volte mais tarde! 📸");
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO DA HALEY ======");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", JSON.stringify(error.response.data));
      } else {
        console.error("Mensagem:", error.message);
      }
      console.error("=======================================");
      
      await message.reply("Eca... meu rolo de filme travou de verdade agora. Me pergunte de novo! 📸🌻");
    }
  }
});

// Mantém o servidor do Render vivo respondendo na porta correta
const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
