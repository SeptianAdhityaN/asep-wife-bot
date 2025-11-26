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

    // 1. Validasi Voice Channel
    if (!channel) {
      return interaction.reply({
        content: "❌ Masuk voice channel dulu.",
        ephemeral: true,
      });
    }

    // 2. Safe Defer (Agar tidak error "Already Acknowledged")
    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        }
    } catch (e) {
        return; // Stop jika interaksi sudah mati
    }

    const player = interaction.client.player;

    try {
      // 3. Setup Queue dengan Konfigurasi "JANGKAR" (Anti Keluar)
      const queue = player.nodes.create(interaction.guild, {
        metadata: { channel: textChannel },
        selfDeaf: true,
        volume: 80,
        
        // --- KONFIGURASI AGAR BOT TIDAK KELUAR ---
        leaveOnEnd: false,        // Jangan keluar saat lagu habis
        leaveOnStop: false,       // Jangan keluar saat di-stop
        leaveOnEmpty: false,      // Jangan keluar saat channel sepi (tidak ada orang)
        leaveOnEmptyCooldown: 0,  // Matikan timer cooldown
        // -----------------------------------------
      });

      if (!queue.connection) await queue.connect(channel);

      // 4. Smart Search
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!searchResult || !searchResult.tracks.length) {
        return interaction.editReply("❌ Lagu tidak ditemukan. Coba sertakan nama penyanyi.");
      }

      // 5. Eksekusi Play
      const entry = await queue.play(searchResult, {
        nodeOptions: { metadata: { channel: textChannel } },
      });

      // 6. Respon Embed
      const embed = new EmbedBuilder().setColor("#00FF00");

      if (searchResult.playlist) {
        embed.setDescription(
          `✅ Menambahkan Playlist **${searchResult.playlist.title}** (${searchResult.tracks.length} lagu) ke antrian.`
        );
      } else {
        // Gunakan data dari entry.track agar akurat
        const trackTitle = entry.track.title;
        const trackAuthor = entry.track.author;
        embed.setDescription(
          `✅ Menambahkan **${trackTitle}** - *${trackAuthor}* ke antrian.`
        );
      }

      return interaction.editReply({ embeds: [embed] });

    } catch (e) {
      console.error(e);
      // Error Handling Anti-Crash
      if (interaction.deferred || interaction.replied) {
         return interaction.editReply(`❌ Gagal memuat: ${e.message}`);
      } else {
         return interaction.reply({ content: `❌ Error: ${e.message}`, ephemeral: true });
      }
    }
  },
};