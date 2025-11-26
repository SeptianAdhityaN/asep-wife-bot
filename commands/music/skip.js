const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Melewati lagu yang sedang diputar'),

    async execute(interaction) {
        // Ambil queue dari player
        const queue = interaction.client.player.nodes.get(interaction.guild.id);

        // Validasi: Apakah ada lagu?
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ 
                content: "❌ Tidak ada lagu yang sedang diputar.", 
                ephemeral: true // Gunakan ini agar konsisten dan anti-error
            });
        }

        // Simpan judul lagu sebelum di-skip untuk laporan
        const currentTrack = queue.currentTrack;
        
        // Lakukan Skip
        queue.node.skip();
        
        return interaction.reply(`⏭️ Berhasil melewati lagu: **${currentTrack.title}**`);
    },
};