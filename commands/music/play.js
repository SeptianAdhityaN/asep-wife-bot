const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Memutar lagu atau playlist")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Judul Lagu, Nama Artis, atau Link (Spotify/YT)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query");
    const channel = interaction.member.voice.channel;
    const textChannel = interaction.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ Masuk voice channel dulu.",
        ephemeral: true,
      });
    }

    try {
      if (!interaction.deferred && !interaction.replied) {
          await interaction.deferReply();
      }
    } catch (e) { return; }

    const player = interaction.client.player;

    try {
      const queue = player.nodes.create(interaction.guild, {
        metadata: { channel: textChannel },
        selfDeaf: true,
        volume: 80,
        leaveOnEnd: false, 
        leaveOnStop: false,
        leaveOnEmpty: false, 
        leaveOnEmptyCooldown: 0, 
      });

      if (!queue.connection) await queue.connect(channel);

      // --- PERBAIKAN UTAMA: SMART ENGINE DETECTION ---
      // Cek apakah input user adalah URL (Link) atau Teks biasa
      const isUrl = query.includes("http") || query.includes("www") || query.includes("youtu");
      
      // Jika Link -> Gunakan AUTO (Biar dia deteksi sendiri itu Spotify/YT/Soundcloud)
      // Jika Teks -> Paksa YOUTUBE_SEARCH (Agar pasti cari di YouTube)
      const searchEngine = isUrl ? QueryType.AUTO : QueryType.YOUTUBE_SEARCH;

      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: searchEngine, // <--- Pakai logika baru
      });

      if (!searchResult || !searchResult.tracks.length) {
        return interaction.editReply("❌ Lagu tidak ditemukan / Link tidak valid.");
      }

      const entry = await queue.play(searchResult, {
        nodeOptions: { metadata: { channel: textChannel } },
      });

      const embed = new EmbedBuilder().setColor("#00FF00");

      if (searchResult.playlist) {
        embed.setDescription(
          `✅ Menambahkan Playlist **${searchResult.playlist.title}** (${searchResult.tracks.length} lagu).`
        );
      } else {
        const trackTitle = entry.track.title;
        const trackAuthor = entry.track.author;
        embed.setDescription(
          `✅ Menambahkan **${trackTitle}** - *${trackAuthor}*`
        );
      }

      return interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      if (interaction.deferred || interaction.replied) {
         return interaction.editReply(`❌ Gagal: ${err.message}`);
      } else {
         return interaction.reply({ content: `❌ Error: ${err.message}`, ephemeral: true });
      }
    }
  },
};