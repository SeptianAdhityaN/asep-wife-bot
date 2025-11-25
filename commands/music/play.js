const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player"); // Import QueryType

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

  async execute(interaction, message, args) {
    let query, channel, member, textChannel;

    // 1. Deteksi Slash vs Prefix
    if (interaction) {
      query = interaction.options.getString("query");
      member = interaction.member;
      channel = interaction.member.voice.channel;
      textChannel = interaction.channel;
      await interaction.deferReply();
    } else {
      query = args.join(" ");
      member = message.member;
      channel = message.member.voice.channel;
      textChannel = message.channel;
    }

    // 2. Validasi
    if (!query)
      return reply(interaction, message, "❌ Masukkan judul lagu atau link!");
    if (!channel)
      return reply(interaction, message, "❌ Masuk voice channel dulu.");

    const player = (interaction || message).client.player;

    try {
      // 3. Setup Queue
      const queue = player.nodes.create(member.guild, {
        metadata: { channel: textChannel },
        selfDeaf: true,
        volume: 80,
        leaveOnEnd: false,
        leaveOnEmpty: false,
        leaveOnEmptyCooldown: 300000,
      });

      if (!queue.connection) await queue.connect(channel);

      // 4. SMART SEARCH LOGIC
      // Kita gunakan 'search' dulu untuk melihat apa yang ditemukan sebelum memainkannya
      const searchResult = await player.search(query, {
        requestedBy: member,
        searchEngine: QueryType.AUTO, // Otomatis deteksi (Spotify Link / YT Search / Playlist)
      });

      if (!searchResult || !searchResult.tracks.length) {
        return reply(
          interaction,
          message,
          "❌ Lagu tidak ditemukan. Coba sertakan nama penyanyi."
        );
      }

      // 5. Eksekusi Play
      // Kita langsung masukkan hasil searchResult agar lebih akurat
      const entry = await queue.play(searchResult, {
        nodeOptions: { metadata: { channel: textChannel } },
      });

      // 6. Respon Embed
      const embed = new EmbedBuilder().setColor("#00FF00");

      // Cek apakah yang dimasukkan itu Playlist atau Single Track
      if (searchResult.playlist) {
        embed.setDescription(
          `Menambahkan Playlist **${searchResult.playlist.title}** (${searchResult.tracks.length} lagu) ke antrian.\n🔗 Sumber: ${searchResult.playlist.source}`
        );
      } else {
        embed.setDescription(
          `Menambahkan **${entry.track.title}** - *${entry.track.author}* ke antrian.`
        );
      }

      reply(interaction, message, { embeds: [embed] });
    } catch (e) {
      console.error(e); // Log error asli ke console biar tau kenapa
      reply(interaction, message, `❌ Gagal memuat: ${e.message}`);
    }
  },
};

// Helper function biar kodingan rapi (bisa balas slash atau prefix)
async function reply(interaction, message, content) {
  if (interaction) {
    // Jika interaction sudah di-defer, pakai editReply
    if (interaction.deferred || interaction.replied)
      return await interaction.editReply(content);
    return await interaction.reply(content);
  }
  return await message.reply(content);
}
