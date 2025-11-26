const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Istri Asep Berbicara (TTS)')
        .addStringOption(option => 
            option.setName('text')
                .setDescription('Kata-kata yang ingin diucapkan')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const channel = interaction.member.voice.channel;
        
        // 1. Validasi
        if (!channel) {
            return interaction.reply({ 
                content: "❌ Masuk voice dulu dong.", 
                ephemeral: true 
            });
        }

        // 2. Beri respon cepat
        await interaction.reply({ content: "🗣️ Mengucapkan...", ephemeral: true });

        // 3. Generate URL Google Translate
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
        
        const player = interaction.client.player;

        try {
            // 4. Play Audio (Dengan settingan anti-kabur)
            await player.play(channel, url, { 
                nodeOptions: { 
                    metadata: { channel: interaction.channel }, 
                    selfDeaf: true,
                    volume: 80,
                    leaveOnEnd: false, 
                    leaveOnStop: false, 
                    leaveOnEmpty: false,
                    leaveOnEmptyCooldown: 0
                } 
            });
        } catch (e) {
            console.error("TTS Error:", e);
            // Tidak perlu reply error ke user karena kita sudah reply "Mengucapkan..." di awal
        }
    },
};