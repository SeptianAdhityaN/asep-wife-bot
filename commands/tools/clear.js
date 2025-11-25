const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Menghapus pesan chat secara massal')
        .addIntegerOption(option => 
            option.setName('jumlah')
                .setDescription('Jumlah pesan yang dihapus (Maks 100)')
                .setRequired(true))
        // Opsional: Hanya izinkan user yang punya izin Manage Messages
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), 
	async execute(interaction) {
        const amount = interaction.options.getInteger('jumlah');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '❌ Masukkan jumlah antara 1 sampai 100.', flags: InteractionFlags.Ephemeral
 });
        }

        try {
            await interaction.channel.bulkDelete(amount, true);
            
            // Kirim pesan konfirmasi lalu hapus otomatis setelah 3 detik
            const msg = await interaction.reply({ content: `🧹 Berhasil menghapus ${amount} pesan!`, fetchReply: true });
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 3000);

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Gagal menghapus pesan. Pesan mungkin lebih tua dari 14 hari.', flags: InteractionFlags.Ephemeral
 });
        }
	},
};