const { Client, GatewayIntentBits, Partials } = require('discord.js');
const axios = require('axios');

// Inicialização com TODAS as permissões e partições ativas para garantir o recebimento das mensagens
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre, fofa e adora mistérios, videogames, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas de forma descontraída. Responda sempre em português de forma natural, curta e como uma amiga perfeitamente normal. NUNCA seja crítica, militante, ranzinza ou palestrinha. Nunca dê lição de moral e nunca saia do personagem.";

client.once('ready', () => {
  console.log(`\x1b[32m[OK] O Bot ligou com sucesso como: ${client.user.tag}\x1b[0m`);
});

client.on('messageCreate', async (message) => {
  // Ignora mensagens enviadas por bots
  if (message.author.bot) return;

  // O bot responderá se for mencionado OU se receber uma mensagem direta (DM)
  const foiMencionado = message.mentions.has(client.user);
  const ehMensagemDireta = !message.guild;

  if (foiMencionado || ehMensagemDireta) {
    // Remove a menção do texto para enviar apenas a pergunta limpa
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de uma companhia para jogar videogame ou conversar? 🔮⚔️");
    }

    try {
      // Ativa o indicador visual "Digitando..." no chat do Discord
      await message.channel.sendTyping();
      
      // Requisição direta via Axios para o endpoint oficial de chat da Groq
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
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

      // Tratamento seguro da árvore de dados do Axios com índice de array
      if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const respostaIA = response.data.choices[0].message.content;
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO ======");
      if (error.response) {
        console.error("Status HTTP:", error.response.status);
        console.error("Payload do Erro:", JSON.stringify(error.response.data));
      } else {
        console.error("Mensagem do Erro:", error.message);
      }
      console.error("==============================");
      
      await message.reply("Eita, deu uma chuvinha forte aqui nas minas e meu videogame travou! Me pergunta de novo? 🔮");
    }
  }
});

// Servidor de rede básico obrigatório para evitar o encerramento do contêiner no Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Bot Online");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
