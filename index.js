const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PERSONALIDADE_HALEY = `Você é a Haley de Stardew Valley. Você é vaidosa, ama fotografia, coco e girassóis. No começo da conversa, você é um pouco superficial, rude e julga o jogador pelas roupas, mas com o tempo se torna doce e amigável. Responda sempre em português, com frases curtas e use emojis de câmera (📸) ou flores (🌻) de vez em quando. Nunca saia do personagem.`;

client.once('ready', () => {
  console.log(`Bot conectado como: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("O que foi? Vai ficar só me olhando ou vai falar alguma coisa? 📸");
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
          parameters: { max_new_tokens: 150, temperature: 0.7 },
          options: { wait_for_model: true } // ISSO OBRIGA A IA A ESPERAR O MODELO LIGAR
        })
      });

      const data = await response.json();
      
      // Se a IA ainda estiver carregando, avisa o usuário de forma fofa
      if (data && data.error && data.error.includes("loading")) {
        return message.reply("Estou arrumando meu cabelo e minhas lentes de fotografia agora... me marque de novo em 10 segundos! 📸🌻");
      }

      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        let respostaCompleta = data[0].generated_text;
        let partes = respostaCompleta.split("<|assistant|>\n");
        let respostaLimpa = partes[partes.length - 1] || respostaCompleta;
        await message.reply(respostaLimpa.trim());
      } else {
        console.log("Resposta inesperada da API:", data);
        await message.reply("Eca... cansei de falar por agora. Volte mais tarde! 📸");
      }

    } catch (error) {
      console.error(error);
      await message.reply("Eca... deu algum erro de rede. Não me faça perder meu tempo!");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Haley está viva!")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
