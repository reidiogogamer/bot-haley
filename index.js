const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk'); // Usando o SDK oficial para evitar erros de rota

// 1. Inicialização do Bot com as permissões corretas
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // ATENÇÃO: Precisa ativar isso no Discord Developer Portal!
  ]
});

// 2. Inicialização da Groq com a biblioteca nativa
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Personalidade da Abigail
const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre, fofa e adora mistérios, videogames, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas de forma descontraída. Responda sempre em português de forma natural, curta e como uma amiga perfeitamente normal. NUNCA dê lição de moral, não seja ranzinza e nunca saia do personagem.";

client.once('ready', () => {
  console.log(`\x1b[32m[SUCESSO] Abigail conectada como: ${client.user.tag}\x1b[0m`);
});

// 3. Monitoramento de Mensagens
client.on('messageCreate', async (message) => {
  // Ignora se for mensagem de outro bot
  if (message.author.bot) return;

  // Verifica se o bot foi mencionado
  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de algo? 🔮⚔️");
    }

    try {
      // Ativa o efeito "Digitando..." no canal
      await message.channel.sendTyping();
      
      // Chamada usando o SDK oficial da Groq e o modelo ativo correto
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: PERSONALIDADE_ABIGAIL },
          { role: "user", content: textoLimpo }
        ],
        model: "llama-3.1-8b-instant", // Modelo atual ativo e super rápido
        temperature: 0.8,
        max_tokens: 100
      });

      // Captura a resposta sem risco de errar o índice do array do Axios
      const respostaIA = completion.choices[0]?.message?.content;

      if (respostaIA) {
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }

    } catch (error) {
      console.error("====== ERRO NA JORNADA DA ABIGAIL ======");
      console.error(error);
      console.error("========================================");
      
      await message.reply("Eita, deu uma chuvinha forte aqui nas minas e meu videogame travou! Pode me perguntar de novo? 🔮");
    }
  }
});

// 4. Servidor Web básico para manter o Render feliz e online
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Abigail Online");
}).listen(process.env.PORT || 3000);

// Conectar ao Discord
client.login(process.env.DISCORD_TOKEN);
