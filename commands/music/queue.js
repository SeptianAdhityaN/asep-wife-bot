const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Melihat daftar antrian lagu'),

    async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);

        // Cek apakah queue ada dan ada lagu yang sedang main (currentTrack)
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ 
                content: "❌ Antrian kosong / Tidak ada musik.", 
                ephemeral: true 
            });
        }

        const currentTrack = queue.currentTrack;
        
        // Ambil 10 lagu berikutnya
        const tracks = queue.tracks.toArray().slice(0, 10).map((m, i) => {
            return `${i + 1}. **${m.title}** - ${m.author}`;
        });

        const embed = new EmbedBuilder()
            .setTitle('📜 Daftar Antrian Musik')
            .setColor('#00FFFF')
            .addFields(
                { 
                    name: '💿 Sedang Diputar', 
                    value: `**[${currentTrack.title}](${currentTrack.url})** \n⏱️ ${currentTrack.duration} • Req: ${currentTrack.requestedBy ? currentTrack.requestedBy.username : 'Auto'}` 
                },
                { 
                    name: '⬇️ Berikutnya', 
                    value: tracks.join('\n') || "Tidak ada lagu lain di antrian." 
                }
            )
            .setFooter({ text: `Total ${queue.tracks.size} lagu menunggu.` });

        return interaction.reply({ embeds: [embed] });
    },
};