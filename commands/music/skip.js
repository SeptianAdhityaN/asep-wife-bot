const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Melewati lagu yang sedang diputar'),
	async execute(interaction) {
        const queue = interaction.client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: "❌ Tidak ada lagu yang sedang diputar.", flags: InteractionFlags.Ephemeral
 });
        }

        const currentTrack = queue.currentTrack;
        queue.node.skip();
        
        return interaction.reply(`⏭️ Berhasil melewati lagu: **${currentTrack.title}**`);
	},
};