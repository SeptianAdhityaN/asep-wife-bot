require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { 
    Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle 
} = require("discord.js");
const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");

process.env.FFMPEG_PATH = require("ffmpeg-static");

// --- KONFIGURASI ---
const MY_ID = process.env.OWNER_ID;
const PREFIX = "";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Setup Player
client.player = new Player(client, {
  ytdlOptions: { quality: "highestaudio", highWaterMark: 1 << 25 },
  skipOnNoStream: true 
});

// Load Commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

client.once("clientReady", async () => {
  await client.player.extractors.loadMulti(DefaultExtractors);
  console.log(`🤖 ${client.user.tag} Siap!`);
});

// --- EVENT MUSIK (DENGAN TOMBOL) ---
client.player.events.on("playerStart", (queue, track) => {
    // Cek apakah ini TTS (Text to Speech), jika iya jangan kirim embed
    if (track.url.includes("google.com/translate_tts")) return;

    const requester = track.requestedBy ? track.requestedBy.username : "Asep";

    // 1. Embed
    const embed = new EmbedBuilder()
        .setTitle(`💿 Sedang Memutar`)
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: 'Durasi', value: track.duration, inline: true },
            { name: 'Requested by', value: requester, inline: true } // Gunakan variabel requester
        )
        .setColor('#FF69B4')
        .setFooter({ text: 'Asisten Pribadi - Asep\'s Wife 💕' });

    // 2. Tombol Interaktif
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pause').setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('resume').setEmoji('▶️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger)
    );

    // Kirim Embed + Tombol
    queue.metadata.channel.send({ embeds: [embed], components: [buttons] });
});

client.player.events.on("playerError", (queue, error) => {
    // 1. Log ke Terminal saja (Biar Anda tahu masalahnya apa)
    console.log(`[Silent Error] ${error.message}`); 

    if (!queue.metadata.isSkipping) {
        queue.metadata.isSkipping = true;
        queue.node.skip();
    }
});

// --- HANDLE INTERACTION (Slash & Buttons) ---
client.on("interactionCreate", async (interaction) => {
    // A. Handle Slash Command
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, null, null);
        } catch (error) {
            console.error(error);
            if (!interaction.replied) interaction.reply({ content: '❌ Error!', flags: InteractionFlags.Ephemeral
 });
        }
    }

    // B. Handle Tombol
    else if (interaction.isButton()) {
        const queue = client.player.nodes.get(interaction.guild.id);
        if (!queue) return interaction.reply({ content: "❌ Musik mati.", flags: InteractionFlags.Ephemeral
 });

        switch (interaction.customId) {
            case 'pause':
                queue.node.setPaused(true);
                return interaction.reply({ content: "⏸️ Jeda.", flags: InteractionFlags.Ephemeral
 });
            case 'resume':
                queue.node.setPaused(false);
                return interaction.reply({ content: "▶️ Lanjut.", flags: InteractionFlags.Ephemeral
 });
            case 'skip':
                queue.node.skip();
                return interaction.reply({ content: "⏭️ Skip.", flags: InteractionFlags.Ephemeral
 });
            case 'stop':
                queue.delete();
                return interaction.reply({ content: "🛑 Stop.", flags: InteractionFlags.Ephemeral
 });
        }
    }
});

// --- HANDLE PREFIX MESSAGE (aw!play, aw!stop) ---
client.on("messageCreate", async (message) => {
    return; // MATIKAN PREFIX COMMAND
});

client.login(process.env.DISCORD_TOKEN);