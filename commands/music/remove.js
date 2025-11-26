const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Menghapus lagu tertentu dari antrian')
        .addIntegerOption(option => 
            option.setName('nomor')
                .setDescription('Nomor urut lagu di antrian (Cek pakai /queue)')
                .setRequired(true)),

    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);

        // Cek antrian
        if (!queue || queue.tracks.size === 0) {
            return interaction.reply({ 
                content: "❌ Antrian kosong, tidak ada yang bisa dihapus.", 
                ephemeral: true 
            });
        }

        const index = interaction.options.getInteger('nomor');
        
        // Validasi nomor (User input 1, Array mulai 0)
        if (index < 1 || index > queue.tracks.size) {
            return interaction.reply({ 
                content: `❌ Nomor lagu tidak ditemukan. Masukkan angka 1 sampai ${queue.tracks.size}.`, 
                ephemeral: true 
            });
        }

        // Hapus lagu
        const trackToRemove = queue.tracks.toArray()[index - 1];
        queue.node.remove(trackToRemove);

        return interaction.reply(`🗑️ Berhasil menghapus: **${trackToRemove.title}** dari antrian.`);
    },
};