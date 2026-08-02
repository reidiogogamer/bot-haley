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
      
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
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
      let respostaCompleta = "";

      // TRATAMENTO UNIVERSAL: Lê o texto não importa o formato que o Hugging Face envie
      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        respostaCompleta = data[0].generated_text;
      } else if (data && data.generated_text) {
        respostaCompleta = data.generated_text;
      } else if (typeof data === 'string') {
        respostaCompleta = data;
      }

      if (respostaCompleta) {
        let partes = respostaCompleta.split("<|assistant|>\n");
        let respostaLimpa = partes[partes.length - 1] || respostaCompleta;
        
        // Remove tags estruturais remanescentes do modelo
        respostaLimpa = respostaLimpa.replace(/<\|[\s\S]*?\|>/g, '').trim();
        
        await message.reply(respostaLimpa || "Não me faça perder tempo.");
      } else {
        await message.reply("Estou arrumando meu cabelo... me pergunte de novo em 10 segundos! 📸🌻");
      }

    } catch (error) {
      console.error("Erro detalhado do bot:", error.response ? error.response.data : error.message);
      
      // Se a API responder um objeto de erro legível, mostramos uma parte dele para diagnóstico
      if (error.response && error.response.data && error.response.data.error) {
        return message.reply(`A IA enviou um alerta: ${error.response.data.error.slice(0, 50)}...`);
      }
      
      await message.reply("Estou limpando minha lente da câmera... tente me marcar de novo! 📸");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
