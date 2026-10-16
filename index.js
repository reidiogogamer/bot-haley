require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');

// Inicializa o cliente do Discord com as permissões necessárias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Inicializa o SDK oficial da Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Prompt do sistema que define quem a IA finge ser
const PERSONALIDADE_ABIGAIL = `Você é a Abigail do jogo Stardew Valley. 
Sua personalidade é amigável, alegre, gamer e você adora mistérios, tocar flauta e explorar as minas. 
De vez em quando, você faz piadas bobas sobre comer quartzo ou ametistas, já que os jogadores brincam com isso. 
Responda SEMPRE em português de forma curta, descontraída e natural, como se estivesse conversando no chat do Discord. 
Nunca saia do personagem e nunca seja rude.`;

client.once('ready', () => {
  console.log(`🔮 Abigail online como: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignora mensagens de outros bots para evitar loops
  if (message.author.bot) return;

  // O bot só responde se for mencionado diretamente
  if (message.mentions.has(client.user)) {
    // Remove a menção do texto para enviar apenas a pergunta real para a IA
    const textoUsuario = message.content.replace(`<@${client.user.id}>`, '').trim();

    // Se o usuário só mencionou o bot sem digitar nada
    if (!textoUsuario) {
      return message.reply("Oi! Tudo bem? Estava aqui limpando minha espada para ir nas minas... precisa de algo? 🔮⚔️");
    }

    try {
      // Mostra o status "Digitando..." no Discord para parecer natural
      await message.channel.sendTyping();

      // Chamada oficial usando o SDK da Groq e o modelo estável recomendado atualmente
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: PERSONALIDADE_ABIGAIL },
          { role: "user", content: textoUsuario }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 150
      });

      // Captura a resposta de forma segura através do SDK oficial
      const respostaAbigail = chatCompletion.choices[0]?.message?.content;

      if (respostaAbigail) {
        await message.reply(respostaAbigail.trim());
      } else {
        await message.reply("Hum... acabei me distraindo com o meu videogame aqui. O que você tinha dito? 🎮");
      }

    } catch (error) {
      console.error("❌ Erro ao processar a resposta da Groq:", error);
      await message.reply("Eita, deu uma chuvinha forte aqui nas minas e meu videogame travou! Pode repetir? 🔮");
    }
  }
});

// Autentica o bot no Discord usando o Token das variáveis de ambiente
client.login(process.env.DISCORD_TOKEN);
