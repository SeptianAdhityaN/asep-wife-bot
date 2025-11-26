const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Memanggil bot masuk ke voice channel (Standby Mode)'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        
        // 1. Validasi Voice Channel
        if (!channel) {
            return interaction.reply({ 
                content: "❌ Masuk voice dulu dong.", 
                ephemeral: true 
            });
        }

        const player = interaction.client.player;

        try {
            // 2. Buat Queue dengan Settingan JANGKAR (Anti Kabur)
            const queue = player.nodes.create(interaction.guild, {
                metadata: { channel: interaction.channel },
                selfDeaf: true,
                volume: 80,
                
                // Konfigurasi agar bot diam (Standby)
                leaveOnEnd: false,         // Jangan keluar saat lagu habis
                leaveOnStop: false,        // Jangan keluar saat di-stop
                leaveOnEmpty: false,       // Jangan keluar saat tidak ada orang
                leaveOnEmptyCooldown: 0    // Matikan timer cooldown
            });

            // 3. Masuk ke Channel
            if (!queue.connection) await queue.connect(channel);
            
            return interaction.reply("Hai sayang! Aku siap menemanimu 💕");

        } catch (e) {
            return interaction.reply({ 
                content: `❌ Gagal join: ${e.message}`, 
                ephemeral: true 
            });
        }
    },
};