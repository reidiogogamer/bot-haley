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

client.once('ready', () => {
  console.log(`Bot conectado como: ${client.user.tag}`);
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
        "https://groq.com",
        {
          model: "gemma2-9b-it",
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

      // CORREÇÃO VISÍVEL: Adicionado o [0] que faltava em choices[0]
      if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const respostaIA = response.data.choices[0].message.content.trim();
        await message.reply(respostaIA);
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }
    } catch (error) {
      // Exibe o erro exato nos logs do Render para monitoramento
      console.error("Erro detalhado:", error.response ? error.response.data : error.message);
      await message.reply("Eita, deu uma chuvinha forte aqui e meu videogame travou! Me pergunta de novo? 🔮");
    }
  }
});

const http = require('http');
http.createServer((req, res) => res.end("Abigail Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
