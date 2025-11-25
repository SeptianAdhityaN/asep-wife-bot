const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Memanggil bot masuk ke voice channel (Standby Mode)'),
	async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: "❌ Masuk voice dulu dong.", flags: InteractionFlags.Ephemeral
 });

        const player = interaction.client.player;

        try {
            // Kita buat queue dengan settingan "Jangkar" (Anti Kabur)
            const queue = player.nodes.create(interaction.guild, {
                metadata: { channel: interaction.channel },
                selfDeaf: true,
                volume: 80,
                leaveOnEnd: false, 
                leaveOnStop: false, 
                leaveOnEmpty: false, 
                leaveOnEmptyCooldown: 300000 // 5 menit
            });

            if (!queue.connection) await queue.connect(channel);
            
            return interaction.reply("Hai sayang! Aku siap menemanimu 💕");
        } catch (e) {
            return interaction.reply({ content: `❌ Gagal join: ${e.message}`, flags: InteractionFlags.Ephemeral
 });
        }
	},
};