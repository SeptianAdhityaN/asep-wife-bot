const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Istri Asep Berbicara (Interupsi Lagu)')
        .addStringOption(option => 
            option.setName('text')
                .setDescription('Kata-kata yang ingin diucapkan')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('lang')
                .setDescription('Bahasa')
                .setRequired(false)
                .addChoices(
                    { name: '🇮🇩 Indonesia', value: 'id' },
                    { name: '🇺🇸 Inggris', value: 'en' },
                    { name: '🇯🇵 Jepang', value: 'ja' },
                    { name: '🇰🇷 Korea', value: 'ko' },
                    { name: 'jdk Jawa', value: 'jw' }, 
                    { name: 'sunda', value: 'su' } 
                )),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const lang = interaction.options.getString("lang") || 'id';
        const channel = interaction.member.voice.channel;
        
        // 1. Validasi
        if (!channel) {
            return interaction.reply({ content: "❌ Masuk voice dulu dong.", ephemeral: true });
        }

        await interaction.deferReply();

        // URL Google Translate
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
        const player = interaction.client.player;

        try {
            // 2. Cek apakah ada lagu yang sedang diputar?
            const queue = player.nodes.get(interaction.guild.id);
            const isPlaying = queue && queue.isPlaying();

            // Cari Track TTS dulu (tanpa memutarnya)
            const searchResult = await player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO 
            });

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply("❌ Gagal memproses suara.");
            }

            const ttsTrack = searchResult.tracks[0];
            ttsTrack.title = `🗣️ ${text.substring(0, 30)}...`; 
            ttsTrack.author = "Eisha💕";

            // --- LOGIKA INTERUPSI ---
            if (isPlaying) {
                // A. Jika sedang ada lagu: "Potong, Sisip, Sambung"
                
                const currentTrack = queue.currentTrack; // Simpan lagu yang sedang main
                
                // 1. Masukkan TTS ke antrian paling depan (Next)
                queue.insertTrack(ttsTrack, 0);

                // 2. Masukkan LAGI lagu yang tadi ke antrian nomor 2 (Setelah TTS)
                // Agar setelah TTS selesai, lagu ini main lagi
                queue.insertTrack(currentTrack, 1);

                // 3. Skip lagu sekarang (agar TTS langsung bunyi)
                queue.node.skip();

                const langName = lang === 'id' ? 'Indo' : lang;
                await interaction.editReply(`⏸️ Menginterupsi lagu untuk bicara (**${langName}**): "${text}"`);

            } else {
                // B. Jika hening: Langsung mainkan biasa
                await player.play(channel, searchResult, { 
                    nodeOptions: { 
                        metadata: { channel: interaction.channel }, 
                        selfDeaf: true,
                        volume: 100,
                        leaveOnEnd: false, 
                        leaveOnStop: false, 
                        leaveOnEmpty: false,
                        leaveOnEmptyCooldown: 0
                    } 
                });
                
                const langName = lang === 'id' ? 'Indo' : lang;
                await interaction.editReply(`🗣️ Mengucapkan (**${langName}**): "${text}"`);
            }

        } catch (e) {
            console.error("TTS Error:", e);
            await interaction.editReply("❌ Gagal bicara.");
        }
    },
};