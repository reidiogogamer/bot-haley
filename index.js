const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Groq = require('groq-sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

// Inicializa a conexão oficial com a API Key da Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Personalidade da Abigail
const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre, fofa e adora mistérios, videogames, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas de forma descontraída. Responda sempre em português de forma natural, curta e como uma amiga perfeitamente normal. NUNCA seja crítica, militante, ranzinza ou palestrinha. Nunca dê lição de moral e nunca saia do personagem.";

client.once('ready', () => {
  console.log(`\x1b[32m[OK] O Bot ligou com sucesso como: ${client.user.tag}\x1b[0m`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const foiMencionado = message.mentions.has(client.user);
  const ehMensagemDireta = !message.guild;

  if (foiMencionado || ehMensagemDireta) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de uma companhia para jogar videogame ou conversar? 🔮⚔️");
    }

    try {
      await message.channel.sendTyping();
      
      // Chamada usando o método oficial do SDK e o modelo correto ativo
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: PERSONALIDADE_ABIGAIL },
          { role: "user", content: textoLimpo }
        ],
        model: "openai/gpt-oss-20b", // MODELO ATIVO ATUALMENTE NA INFRAESTRUTURA DA GROQ
        temperature: 0.6,
        max_completion_tokens: 100
      });

      // Captura estável usando o padrão de array do SDK oficial
      const respostaIA = chatCompletion.choices?.[0]?.message?.content;

      if (respostaIA) {
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO ======");
      console.error(error.message || error);
      console.error("==============================");
      
      await message.reply("Eita, deu uma chuvinha forte aqui nas minas e meu videogame travou! Me pergunta de novo? 🔮");
    }
  }
});

// Servidor de rede básico para manter o Render feliz e ativo
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Bot Online");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
