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

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: "❌ Antrian kosong.", flags: InteractionFlags.Ephemeral
 });
        }

        const index = interaction.options.getInteger('nomor');
        
        // Validasi nomor (karena array mulai dari 0, tapi user input mulai dari 1)
        if (index < 1 || index > queue.tracks.size) {
            return interaction.reply({ content: "❌ Nomor lagu tidak ditemukan.", flags: InteractionFlags.Ephemeral
 });
        }

        // Hapus lagu
        const trackToRemove = queue.tracks.toArray()[index - 1];
        queue.node.remove(trackToRemove);

        return interaction.reply(`🗑️ Berhasil menghapus: **${trackToRemove.title}** dari antrian.`);
	},
};