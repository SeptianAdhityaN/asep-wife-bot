const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Menghapus pesan chat secara massal")
    .addIntegerOption((option) =>
      option
        .setName("jumlah")
        .setDescription("Jumlah pesan yang dihapus (Maks 100)")
        .setRequired(true)
    )
    // Hanya izinkan user yang punya izin Manage Messages
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("jumlah");

    // Validasi jumlah
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "❌ Masukkan jumlah antara 1 sampai 100.",
        ephemeral: true, // FIX: Gunakan ini agar tidak error
      });
    }

    try {
      // Lakukan penghapusan (bulkDelete)
      // Parameter 'true' artinya: Abaikan pesan error jika ada pesan tua (>14 hari) yang tidak bisa dihapus
      await interaction.channel.bulkDelete(amount, true);

      // Kirim konfirmasi lalu hapus otomatis
      const msg = await interaction.reply({
        content: `🧹 Berhasil menghapus ${amount} pesan!`,
        fetchReply: true,
      });

      // Hapus pesan konfirmasi bot setelah 3 detik agar chat bersih
      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 3000);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "❌ Gagal menghapus pesan. Pastikan bot punya izin dan pesan tidak lebih tua dari 14 hari.",
        ephemeral: true, // FIX: Gunakan ini agar tidak error
      });
    }
  },
};
