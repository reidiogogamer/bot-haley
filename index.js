const { Client, GatewayIntentBits } = require('discord.js');

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
      
      // Trocando para o modelo da Microsoft que carrega instantaneamente
      const response = await fetch("https://huggingface.co", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<|system|>\n${PERSONALIDADE_HALEY}\n<|user|>\n${textoLimpo}\n<|assistant|>\n`,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        })
      });

      const data = await response.json();
      
      // Se o Hugging Face rejeitar o token, ele avisa
      if (data && data.error && data.error.includes("Authorization")) {
        return message.reply("Eca... o seu token do Hugging Face deu erro de autorização no Render! Verifique a chave.");
      }

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
      console.error(error);
      await message.reply("Ocorreu um erro interno de leitura. Verifique os logs!");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
