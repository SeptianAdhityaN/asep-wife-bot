require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { 
    Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events 
} = require("discord.js");
const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");

// Paksa lokasi FFmpeg
process.env.FFMPEG_PATH = require("ffmpeg-static");

// --- KONFIGURASI ---
const MY_ID = "707811317053915207";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// --- SETUP PLAYER DENGAN MEDIAPLEX ---
client.player = new Player(client, {
  ytdlOptions: { 
      quality: "highestaudio", 
      highWaterMark: 1 << 25 
  },
  skipOnNoStream: true
});

// Load Commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        if (fs.lstatSync(commandsPath).isDirectory()) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                }
            }
        }
    }
}

client.once(Events.ClientReady, async () => {
  // Load Extractors
  await client.player.extractors.loadMulti(DefaultExtractors);
  console.log(`🤖 ${client.user.tag} Siap! (Mediaplex & FFmpeg Ready)`);
});

// --- EVENT MUSIK ---
client.player.events.on("playerStart", (queue, track) => {
    if (track.url.includes("google.com/translate_tts")) return;

    const requester = track.requestedBy ? track.requestedBy.username : "Auto";

    const embed = new EmbedBuilder()
        .setTitle(`💿 Sedang Memutar`)
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: 'Durasi', value: track.duration, inline: true },
            { name: 'Requested by', value: requester, inline: true }
        )
        .setColor('#FF69B4')
        .setFooter({ text: 'Asisten Pribadi Asep\'s Wife 💕' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pause').setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('resume').setEmoji('▶️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger)
    );

    queue.metadata.channel.send({ embeds: [embed], components: [buttons] });
});

client.player.events.on("playerError", (queue, error) => {
    console.log(`[Player Error] ${error.message}`);
    if (!queue.metadata.isSkipping) {
        queue.metadata.isSkipping = true;
        queue.node.skip();
    }
});

client.player.events.on("error", (queue, error) => {
    console.log(`[Connection Error] ${error.message}`);
});

// --- INTERACTION HANDLER ---
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.user.id !== MY_ID) {
        return interaction.reply({ content: "❌ Bot Pribadi.", ephemeral: true });
    }

    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Error!', ephemeral: true }).catch(()=>{});
            } else {
                await interaction.reply({ content: '❌ Error!', ephemeral: true }).catch(()=>{});
            }
        }
    } else if (interaction.isButton()) {
        const queue = client.player.nodes.get(interaction.guild.id);
        if (!queue) return interaction.reply({ content: "❌ Musik mati.", ephemeral: true });

        try {
            switch (interaction.customId) {
                case 'pause': queue.node.setPaused(true); return interaction.reply({ content: "⏸️", ephemeral: true });
                case 'resume': queue.node.setPaused(false); return interaction.reply({ content: "▶️", ephemeral: true });
                case 'skip': queue.node.skip(); return interaction.reply({ content: "⏭️", ephemeral: true });
                case 'stop': queue.delete(); return interaction.reply({ content: "🛑", ephemeral: true });
            }
        } catch (e) { }
    }
});

client.login(process.env.DISCORD_TOKEN);