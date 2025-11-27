require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events 
} = require("discord.js");
const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");

process.env.FFMPEG_PATH = require("ffmpeg-static");

// --- KONFIGURASI ---
const MY_ID = process.env.OWNER_ID;

// --- COOKIE DATA (Paste Array JSON Anda disini) ---
const RAW_COOKIES = [
    { "name": "__Secure-1PAPISID", "value": "oaYmftOvotSQC79c/AFfMZ-Gj9DLssLHn-" },
    { "name": "__Secure-1PSID", "value": "g.a0003ghaglpLJ9c7Jefz2A-A5WesvTDyvZ31gHOU4ECQyoW9dLOyTg59-VbqhZoP3PtTCauHMQACgYKAQ0SARESFQHGX2MijwrMe2JkFJsVRCzHmCsHSxoVAUF8yKpVd0EO8-CpURDdBnIQcjyD0076" },
    { "name": "__Secure-1PSIDCC", "value": "AKEyXzWdoODiCfNhiF2zzPuQNqkkNRDIjys94-pIoaMeAq_6k3w1_3qnqwQ1_Te_OGDDQaRdNA" },
    { "name": "__Secure-1PSIDTS", "value": "sidts-CjQBwQ9iI9jRCNTSFygmBTyE2-ns_qZyhrfA93lIxBRu5x-sGkKAS78o6UgtlTRTgtkuhruNEAA" },
    { "name": "__Secure-3PAPISID", "value": "oaYmftOvotSQC79c/AFfMZ-Gj9DLssLHn-" },
    { "name": "__Secure-3PSID", "value": "g.a0003ghaglpLJ9c7Jefz2A-A5WesvTDyvZ31gHOU4ECQyoW9dLOyt3wZA7dUCYhVgpflHaAbggACgYKAb8SARESFQHGX2Miw7QqmN9AqGS_anyuBBGDRxoVAUF8yKo77Gzq9dFpz1VcLqcQRin_0076" },
    { "name": "__Secure-3PSIDCC", "value": "AKEyXzXqgo7tbowtHdCpbJm6KccRo4BWJllQuNm3Lz4Tb00aE2Rirh35AOCBRCSUf65L-WUc9l8" },
    { "name": "__Secure-3PSIDTS", "value": "sidts-CjQBwQ9iI9jRCNTSFygmBTyE2-ns_qZyhrfA93lIxBRu5x-sGkKAS78o6UgtlTRTgtkuhruNEAA" },
    { "name": "APISID", "value": "b5_C_PdRHlSe3kyg/AjG3z8jT7srtOx3yS" },
    { "name": "HSID", "value": "AeTWVDTN4c_FkH0XO" },
    { "name": "LOGIN_INFO", "value": "AFmmF2swRQIhAJm-pofi7omU_fFCzjHyQOfgo1ii76POiqUQ-0ukKKoMAiBRtB5o81GZNYz03zoHr27S1TPx3ffe9k-EqxZKondXaQ:QUQ3MjNmeUdJM3g4VVc2LU8wWDctOG9JWnlQX01sNE1mVXVNVURZaUdmRGstSnZ0OGJQUDZtLVc3dkFrZXI5U1FVN3JXbG9zWkN2Si1fVlMzOUdseVBGQ0hhYllVTEFzcE5ncy1HcVJBbXlwdFIya1c2RE1UN1dmQlhsTm1JRnpBT21CUFNsQlhNTGhLOHdGbm95dTRoRlhvZW4zOWJGM1R3" },
    { "name": "PREF", "value": "tz=Asia.Bangkok&f4=4000000&f6=40000000&f5=30000&f7=100" },
    { "name": "SAPISID", "value": "oaYmftOvotSQC79c/AFfMZ-Gj9DLssLHn-" },
    { "name": "SID", "value": "g.a0003ghaglpLJ9c7Jefz2A-A5WesvTDyvZ31gHOU4ECQyoW9dLOyBPm9SFGNExyIZW1WWuYD6wACgYKAWwSARESFQHGX2MirQVoQ8RPnVjTomqneygZKRoVAUF8yKoiJk7r79H_Y0jiMqI1fa8m0076" },
    { "name": "SIDCC", "value": "AKEyXzW_ZlOzpi_KbsLKtM1ngeGZCVLuZSwDkERP6oZuxCvHMCsyd3u598QE0VRr72AxpLsZna4" },
    { "name": "SSID", "value": "AxqYnn5RkHMWoroe4" }
];

// Konversi Cookie ke format Header HTTP
const COOKIE_STRING = RAW_COOKIES.map(c => `${c.name}=${c.value}`).join('; ');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// --- SETUP PLAYER (COOKIE DISUNTIKKAN DISINI) ---
client.player = new Player(client, {
  ytdlOptions: { 
      quality: "highestaudio", 
      highWaterMark: 1 << 25,
      requestOptions: {
          headers: {
              cookie: COOKIE_STRING, // <--- Ini Kuncinya!
              'x-youtube-identity-token': RAW_COOKIES.find(c => c.name === 'ID_TOKEN')?.value || ''
          }
      }
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

// --- PERBAIKAN READY EVENT ---
// Kita pakai loadMulti biasa saja agar tidak crash
client.once(Events.ClientReady, async () => {
  await client.player.extractors.loadMulti(DefaultExtractors);
  console.log(`🤖 ${client.user.tag} Siap! (Mode: Cookie via Player Config)`);
});

// --- EVENT MUSIK ---
client.player.events.on("playerStart", (queue, track) => {
    if (track.url.includes("google.com/translate_tts")) return;

    const requester = track.requestedBy ? track.requestedBy.username : "System";

    const embed = new EmbedBuilder()
        .setTitle(`💿 Sedang Memutar`)
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: 'Durasi', value: track.duration, inline: true },
            { name: 'Requested by', value: requester, inline: true }
        )
        .setColor('#FF69B4')
        .setFooter({ text: 'Asisten Pribadi Asep - Eisha💕' });

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

// --- HANDLE INTERACTION ---
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