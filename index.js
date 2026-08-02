const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // Mudança para o Axios estável

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
      
      // Fazendo a requisição usando Axios que não trava no Render
      const response = await axios.post(
        "https://huggingface.co",
        {
          inputs: `<|system|>\n${PERSONALIDADE_HALEY}\n<|user|>\n${textoLimpo}\n<|assistant|>\n`,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;

      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        let respostaCompleta = data[0].generated_text;
        let partes = respostaCompleta.split("<|assistant|>\n");
        let respostaLimpa = partes[partes.length - 1] || respostaCompleta;
        
        respostaLimpa = respostaLimpa.replace(/<\|[\s\S]*?\|>/g, '').trim();
        await message.reply(respostaLimpa || "Não me faça perder tempo.");
      } else {
        await message.reply("Estou arrumando meu cabelo... me pergunte de novo em 10 segundos! 📸🌻");
      }

    } catch (error) {
      console.error("Erro detalhado:", error.response ? error.response.data : error.message);
      
      if (error.response && error.response.status === 401) {
        return message.reply("Eca... o seu token do Hugging Face está com erro de digitação no Render!");
      }
      
      await message.reply("Eca... cansei de falar por agora. Não me faça perder meu tempo! 📸");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
