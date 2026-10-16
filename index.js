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

const PERSONALIDADE_HALEY = "Você é a Haley do jogo Stardew Valley. Você é extremamente amigável, alegre, estilosa, fofa e adora fotografia, moda, maquiagem e passar o tempo na praia procurando conchas. Você ama conversar com as pessoas e é sempre muito positiva, vaidosa e divertida. Às vezes você comenta sobre tirar fotos com sua câmera ou brinca sobre odiar rabanetes. Responda sempre em português de forma natural, curta e como uma amiga perfeitamente normal e estilosa. NUNCA seja crítica, ranzinza, palestrinha ou dê lição de moral. Nunca saia do personagem.";

// Memória de curto prazo: armazena o histórico por usuário
const MAPA_MEMORIA = new Map();

client.once('ready', () => {
  console.log(`\x1b[32m[OK] O Bot da Haley ligou com sucesso como: ${client.user.tag}\x1b[0m`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const foiMencionado = message.mentions.has(client.user);
  const ehMensagemDireta = !message.guild;

  if (foiMencionado || ehMensagemDireta) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("Oi! Tudo bem? Estava aqui organizando minhas roupas e limpando a lente da minha câmera... precisa de alguma dica de moda ou quer apenas conversar? 📸👗");
    }

    try {
      await message.channel.sendTyping();
      
      // Inicializa o histórico do usuário se não existir
      if (!MAPA_MEMORIA.has(message.author.id)) {
        MAPA_MEMORIA.set(message.author.id, []);
      }
      
      const historicoUsuario = MAPA_MEMORIA.get(message.author.id);
      
      // Adiciona a nova mensagem do usuário ao histórico
      historicoUsuario.push({ role: "user", content: textoLimpo });

      // Monta a estrutura de mensagens contendo o histórico e a personalidade
      const mensagensAPI = [
        { role: "system", content: PERSONALIDADE_HALEY },
        ...historicoUsuario
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: mensagensAPI,
        model: "openai/gpt-oss-20b", 
        temperature: 0.6,
        max_completion_tokens: 100
      });

      const respostaIA = chatCompletion.choices?.[0]?.message?.content;

      if (respostaIA) {
        // Salva a resposta da Haley na memória dela para o próximo turno
        historicoUsuario.push({ role: "assistant", content: respostaIA.trim() });
        
        // Mantém apenas as últimas 10 mensagens (5 perguntas e 5 respostas) para não estourar os tokens
        if (historicoUsuario.length > 10) {
          historicoUsuario.shift();
          historicoUsuario.shift();
        }

        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Hum... acabei me distraindo olhando umas revistas de moda aqui. O que você tinha dito, amigo? 💅");
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO ======");
      console.error(error.message || error);
      console.error("==============================");
      await message.reply("Eita, acho que a bateria da minha câmera acabou e o sistema travou! Pode me perguntar de novo? 📸");
    }
  }
});

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Haley Viva");
}).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
