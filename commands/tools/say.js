const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Istri Asep Berbicara (TTS)')
        .addStringOption(option => 
            option.setName('text')
                .setDescription('Kata-kata yang ingin diucapkan')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('lang')
                .setDescription('Pilih Bahasa (Default: Indo)')
                .setRequired(false)
                .addChoices(
                    { name: '🇮🇩 Indonesia', value: 'id' },
                    { name: '🇺🇸 Inggris', value: 'en' },
                    { name: '🇯🇵 Jepang', value: 'ja' },
                    { name: '🇰🇷 Korea', value: 'ko' },
                    { name: 'jdk Jawa (Google Support)', value: 'jw' }, 
                    { name: 'sunda (Otomatis)', value: 'su' } 
                )),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        // Ambil bahasa yang dipilih, kalau tidak pilih default ke 'id' (Indo)
        const lang = interaction.options.getString("lang") || 'id'; 
        
        const channel = interaction.member.voice.channel;
        
        // 1. Validasi
        if (!channel) {
            return interaction.reply({ 
                content: "❌ Masuk voice dulu dong.", 
                ephemeral: true 
            });
        }

        // 2. Beri respon cepat
        const langName = lang === 'id' ? 'Indo' : lang;
        await interaction.reply({ content: `🗣️ Mengucapkan (${langName})...`, ephemeral: true });

        // 3. Generate URL Google Translate dengan Bahasa Dinamis
        // Perhatikan bagian '&tl=${lang}'
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
        
        const player = interaction.client.player;

        try {
            // 4. Play Audio
            await player.play(channel, url, { 
                nodeOptions: { 
                    metadata: { channel: interaction.channel }, 
                    selfDeaf: true,
                    volume: 100, // Volume TTS biasanya pelan, kita set 100
                    leaveOnEnd: false, 
                    leaveOnStop: false, 
                    leaveOnEmpty: false,
                    leaveOnEmptyCooldown: 0
                } 
            });
        } catch (e) {
            console.error("TTS Error:", e);
        }
    },
};