const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Groq = require('groq-sdk');
const http = require('http');

// 1. INICIALIZAÇÃO DA API DA GROQ
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. CONFIGURAÇÃO DE PERSONALIDADES
const PERSONALIDADE_HALEY = "Você é a Haley do jogo Stardew Valley. Você é extremamente amigável, alegre, estilosa, fofa e adora fotografia, moda, maquiagem e passar o tempo na praia procurando conchas. Você ama conversar com as pessoas e é sempre muito positiva, vaidosa e divertida. Às vezes você comenta sobre tirar fotos com sua câmera ou brinca sobre odiar rabanetes. Responda sempre em português de forma natural, descontraída e estilosa. Você pode escrever respostas um pouco mais detalhadas e completas de até 6 linhas se a conversa pedir, mas NUNCA deixe suas frases cortadas ou pela metade. Sempre conclua o seu raciocínio.";

const PERSONALIDADE_ABIGAIL = "Você é a Abigail de Stardew Valley. Você é amigável, alegre e adora mistérios, videogames, jogar de bruxa, tocar flauta e explorar as minas. Às vezes você brinca sobre comer quartzo ou ametistas porque as pessoas dizem que você faz isso. Responda sempre em português de forma natural, curta, descontraída e como uma pessoa perfeitamente normal. Nunca saia do personagem e conclua sempre o seu raciocínio.";

// 3. MAPAS DE MEMÓRIA (UM PARA CADA PERSONAGEM)
const MEMORIA_HALEY = new Map();
const MEMORIA_ABIGAIL = new Map();

// 4. FUNÇÃO CENTRAL DA INTELIGÊNCIA ARTIFICIAL
async function processarMensagemIA(message, client, mapaMemoria, personalidade, saudacaoVazia, mensagemErro) {
  if (message.author.bot) return;

  const foiMencionado = message.mentions.has(client.user);
  const ehMensagemDireta = !message.guild;

  if (foiMencionado || ehMensagemDireta) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply(saudacaoVazia);
    }

    try {
      await message.channel.sendTyping();
      
      if (!mapaMemoria.has(message.author.id)) {
        mapaMemoria.set(message.author.id, []);
      }
      
      const historicoUsuario = mapaMemoria.get(message.author.id);
      historicoUsuario.push({ role: "user", content: textoLimpo });

      const mensagensAPI = [
        { role: "system", content: personalidade },
        ...historicoUsuario
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: mensagensAPI,
        model: "llama-3.3-70b-versatile", // Modelo de produção de alta performance e ativo
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
        await message.reply(mensagemErro);
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO ======");
      console.error(error.message || error);
      console.error("==============================");
      await message.reply("Eita, acho que meu sistema deu uma travadinha! Pode me perguntar de novo? 📋");
    }
  }
}

// ==========================================
// INICIALIZAÇÃO DA HALEY
// ==========================================
if (process.env.DISCORD_TOKEN_HALEY) {
  const clientHaley = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Message]
  });

  clientHaley.once('ready', () => {
    console.log(`\x1b[32m[OK] O Bot da Haley ligou com sucesso como: ${clientHaley.user.tag}\x1b[0m`);
  });

  clientHaley.on('messageCreate', (message) => {
    processarMensagemIA(
      message,
      clientHaley,
      MEMORIA_HALEY,
      PERSONALIDADE_HALEY,
      "Oi! Tudo bem? Estava aqui organizando minhas roupas e limpando a lente da minha câmera... precisa de alguma dica de moda ou quer apenas conversar? 📸👗",
      "Hum... acabei me distraindo olhando umas revistas de moda aqui. O que você tinha dito, amigo? 💅"
    );
  });

  clientHaley.login(process.env.DISCORD_TOKEN_HALEY);
}

// ==========================================
// INICIALIZAÇÃO DA ABIGAIL
// ==========================================
if (process.env.DISCORD_TOKEN_ABIGAIL) {
  const clientAbigail = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Message]
  });

  clientAbigail.once('ready', () => {
    console.log(`\x1b[34m[OK] O Bot da Abigail ligou com sucesso como: ${clientAbigail.user.tag}\x1b[0m`);
  });

  clientAbigail.on('messageCreate', (message) => {
    processarMensagemIA(
      message,
      clientAbigail,
      MEMORIA_ABIGAIL,
      PERSONALIDADE_ABIGAIL,
      "Oi! Tudo bem? Estava aqui pensando em ir explorar as minas... precisa de algo ou quer só jogar um videogame? 🔮⚔️",
      "Hum... acabei me distraindo com o meu console aqui. O que você tinha falado? 🎮"
    );
  });

  clientAbigail.login(process.env.DISCORD_TOKEN_ABIGAIL);
}

// 5. SERVIDOR WEB UNIFICADO PARA O UPTIMEROBOT
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Central de Bots da Haley e Abigail Viva!");
}).listen(process.env.PORT || 3000);
