const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Mudança drástica na personalidade para termos certeza absoluta que atualizou
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
      
      const response = await fetch("https://huggingface.co", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<|system|>\n${PERSONALIDADE_HALEY}\n<|user|>\n${textoLimpo}\n<|assistant|>\n`,
          parameters: { max_new_tokens: 100, temperature: 0.6 }
        })
      });

      const data = await response.json();
      
      // MUDANÇA DE FRASE PARA TESTE: Se der erro, ela vai falar "ERRO SECRETO"
      if (data && Array.isArray(data) && data[0] && data[0].generated_text) {
        let respostaCompleta = data[0].generated_text;
        let partes = respostaCompleta.split("<|assistant|>\n");
        let respostaLimpa = partes[partes.length - 1] || respostaCompleta;
        await message.reply(respostaLimpa.trim());
      } else {
        console.log("Erro da API:", data);
        await message.reply("Desculpe, meu cérebro de IA deu um nó agora! 🌻");
      }

    } catch (error) {
      console.error(error);
      await message.reply("ERRO SECRETO DA HALEY! 📸");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
