const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Berhenti memutar musik dan membersihkan antrian"),

  async execute(interaction) {
    // Ambil queue dari player
    const queue = interaction.client.player.nodes.get(interaction.guild.id);

    if (queue) {
      // queue.delete() akan mematikan musik dan menghapus seluruh antrian
      queue.delete();
      return interaction.reply("🛑 Musik dihentikan dan antrian dibersihkan.");
    }

    // --- FALLBACK (Jaga-jaga) ---
    // Jika tidak ada antrian (queue) tapi bot masih nyangkut di voice channel
    const me = interaction.guild.members.me;
    if (me.voice.channel) {
      try {
          await me.voice.disconnect();
          return interaction.reply("👋 Bot keluar dari voice channel.");
      } catch (error) {
          // Jika gagal disconnect (biasanya masalah izin)
          return interaction.reply({ content: "❌ Gagal keluar voice channel (Cek Izin Bot).", ephemeral: true });
      }
    }

    // Jika bot tidak sedang memutar lagu dan tidak di voice channel
    return interaction.reply({
      content: "❌ Saya sedang tidak memutar musik.",
      ephemeral: true,
    });
  },
};