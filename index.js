const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PERSONALIDADE_HALEY = "Você é a Haley de Stardew Valley. Vaidosa, adora fotografia, girassóis e moda. Responda sempre em português, com frases curtas e ácidas.";

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
      
      // Conectando à API pública da Cloudflare para rodar o Llama 3 direto
      const response = await axios.post(
        "https://cloudflare.com",
        {
          messages: [
            { role: "system", content: PERSONALIDADE_HALEY },
            { role: "user", content: textoLimpo }
          ]
        },
        {
          headers: {
            "Authorization": "Bearer Bearer df8_R7B_lIunM1X9S5Lp9E83bY9v5R_2NmlO9X3z",
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;

      if (data && data.result && data.result.response) {
        await message.reply(data.result.response.trim());
      } else {
        await message.reply("O que você quer? Não estou com paciência para conversar agora. 📸");
      }

    } catch (error) {
      console.error(error);
      await message.reply("Cansei... Minha câmera quebrou e eu não quero mais falar com ninguém! 📸🌻");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
