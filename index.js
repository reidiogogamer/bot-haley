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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre, fofa e adora mistérios, videogames, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas de forma descontraída. Responda sempre em português de forma natural, descontraída e amigável. Você pode escrever respostas um pouco mais detalhadas e completas de até 6 linhas se a conversa pedir, mas NUNCA deixe suas frases cortadas ou pela metade. Sempre conclua o seu raciocínio.";

const MAPA_MEMORIA = new Map();

client.once('ready', () => {
  console.log(`\x1b[32m[OK] O Bot da Abigail ligou com sucesso como: ${client.user.tag}\x1b[0m`);
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
      
      if (!MAPA_MEMORIA.has(message.author.id)) {
        MAPA_MEMORIA.set(message.author.id, []);
      }
      
      const historicoUsuario = MAPA_MEMORIA.get(message.author.id);
      historicoUsuario.push({ role: "user", content: textoLimpo });

      const mensagensAPI = [
        { role: "system", content: PERSONALIDADE_ABIGAIL },
        ...historicoUsuario
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: mensajesAPI,
        model: "openai/gpt-oss-20b", // CORREÇÃO: Modelo oficial, ativo e estável da plataforma 🚀
        temperature: 0.6,
        max_completion_tokens: 250
      });

      const respostaIA = chatCompletion.choices?.[0]?.message?.content;

      if (respostaIA) {
        historicoUsuario.push({ role: "assistant", content: respostaIA.trim() });
        
        if (historicoUsuario.length > 10) {
          historicoUsuario.shift();
          historicoUsuario.shift();
        }

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

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Abigail Viva");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
