const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PERSONALIDADE_HALEY = "Você é a Haley de Stardew Valley. Vaidosa, adora fotografia, girassóis e moda. Responda sempre em português, com frases curtas e ácidas. Nunca saia do personagem.";

client.once('ready', () => {
  console.log(`Bot conectado como: ${client.user.tag}`);
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
      
      // Conexão ultra rápida com o motor da Groq usando o modelo Llama 3
      const response = await axios.post(
        "https://groq.com",
        {
          model: "llama3-8b-8192",
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

      if (response.data && response.data.choices && response.data.choices[0].message) {
        const respostaIA = response.data.choices[0].message.content.trim();
        await message.reply(respostaIA);
      } else {
        await message.reply("Eca... cansei de falar por agora. Volte mais tarde! 📸");
      }

    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      await message.reply("Eca... meu rolo de filme travou. Me pergunte de novo! 📸🌻");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
