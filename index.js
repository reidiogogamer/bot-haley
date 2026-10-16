const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Personalidade oficial da Haley
const PERSONALIDADE_HALEY = "Você é a Haley de Stardew Valley. Vaidosa, adora fotografia, girassóis e moda. Responda sempre em português, com frases curtas e ácidas. Nunca saia do personagem.";

client.once('ready', () => {
  console.log(`[BOT] Haley conectada com sucesso como: ${client.user.tag}`);
  console.log(`[CHECK] Token do Discord: ${process.env.DISCORD_TOKEN ? "OK" : "FALTANDO"}`);
  console.log(`[CHECK] API Key da Groq: ${process.env.GROQ_API_KEY ? "OK" : "FALTANDO"}`);
});

client.on('messageCreate', async (message) => {
  // Ignora mensagens de outros bots
  if (message.author.bot) return;

  // Verifica se o bot foi mencionado
  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("O que foi? 📸");
    }

    try {
      // Mostra que o bot está digitando
      await message.channel.sendTyping();
      
      // CORRIGIDO: Agora usando o endpoint oficial da API de inferência da Groq
      const response = await axios.post(
        "https://groq.com",
        {
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

      // Estrutura do Optional Chaining limpa e correta
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

// Sistema para manter o Render ativo na porta correta
const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
