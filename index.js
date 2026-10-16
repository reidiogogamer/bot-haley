const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Personalidade oficial da Haley
const PERSONALIDADE_HALEY = "Você é a Haley de Stardew Valley. Vaidosa, adora fotografia, girassóis e moda. Responda sempre em português, com frases curtas e ácidas. Nunca saia do personagem.";

client.once('ready', () => {
  console.log(`[BOT] Haley conectada com sucesso como: ${client.user.tag}`);
  console.log(`[CHECK] Token do Discord: ${process.env.DISCORD_TOKEN ? "OK" : "FALTANDO"}`);
  console.log(`[CHECK] API Key da Groq: ${process.env.GROQ_API_KEY ? "OK" : "FALTANDO"}`);
});

client.on('messageCreate', async (message) => {
  // Ignora mensagens de outros bots
  if (message.author.bot) return;

  // Verifica se o bot foi mencionado
  if (message.mentions.has(client.user)) {
    const textoLimpo = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!textoLimpo) {
      return message.reply("O que foi? 📸");
    }

    try {
      // Mostra que o bot está digitando no Discord
      await message.channel.sendTyping();
      
      // Endpoint oficial de chat da Groq Cloud
      const response = await axios.post(
        "https://groq.com",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: PERSONALIDADE_HALEY },
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

      // Sintaxe clássica e segura para evitar incompatibilidade de versão do Node
      if (response && response.data && response.data.choices && response.data.choices[0]) {
        const respostaIA = response.data.choices[0].message.content;
        await message.reply(respostaIA.trim());
      } else {
        await message.reply("Eca... cansei de falar por agora. Volte mais tarde! 📸");
      }

    } catch (error) {
      console.error("====== DETALHES DO ERRO DA HALEY ======");
      if (error.response) {
        console.error("Status HTTP:", error.response.status);
        console.error("Dados do Erro:", JSON.stringify(error.response.data));
      } else {
        console.error("Mensagem de Erro:", error.message);
      }
      console.error("=======================================");
      
      await message.reply("Eca... meu rolo de filme travou de verdade agora. Me pergunte de novo! 📸🌻");
    }
  }
});

// Garante que o Render não dê Timeout (Porta obrigatória)
const http = require('http');
http.createServer((req, res) => res.end("Haley Viva")).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
 
