const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lofi')
        .setDescription('Mode Radio 24/7 (Non-stop Music)')
        .addStringOption(option => 
            option.setName('mood')
                .setDescription('Pilih suasana musik')
                .setRequired(false)
                .addChoices(
                    { name: '☕ Lofi Study/Chill (Default)', value: 'lofi' },
                    { name: '🎷 Jazz Coffee Shop', value: 'jazz' },
                    { name: '🌙 Sleep/Piano', value: 'sleep' },
                    { name: '🏖️ Summer Vibe', value: 'summer' }
                )),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        const mood = interaction.options.getString('mood') || 'lofi';

        // 1. Validasi
        if (!channel) {
            return interaction.reply({ content: "❌ Masuk voice dulu dong, Sayang.", ephemeral: true });
        }

        // 2. Defer Reply (Anti Crash)
        await interaction.deferReply();

        // 3. Tentukan URL Playlist berdasarkan Mood
        let url;
        let title;
        let img;

        switch (mood) {
            case 'jazz':
                url = 'https://www.youtube.com/playlist?list=PLJ_QRA6aHwlgk3tF5qFvB3s5Xul_n5u5d'; // Jazz Vibes
                title = "🎷 Jazz Coffee Shop";
                img = "https://i.ytimg.com/vi/tNkZsRW7h2c/maxresdefault.jpg";
                break;
            case 'sleep':
                url = 'https://www.youtube.com/playlist?list=PLJ_QRA6aHwlheC8W5qfXLPf7P5y6C8g8E'; // Sleep Piano
                title = "🌙 Sleep & Relax";
                img = "https://i.ytimg.com/vi/4Tr0otuiQuU/maxresdefault.jpg";
                break;
            case 'summer':
                url = 'https://www.youtube.com/playlist?list=PLJ_QRA6aHwli_MnXSbqKsQ7N5V8q9kOQ-'; // Summer
                title = "🏖️ Summer Vibes";
                img = "https://i.ytimg.com/vi/7NOSDKb0HlU/maxresdefault.jpg";
                break;
            default: // Lofi (Default)
                url = 'https://www.youtube.com/playlist?list=PLJ_QRA6aHwlg6gD0ZJ9kE3_9tQOQJq_7-'; // Lofi Girl Records
                title = "☕ Lofi Study & Chill";
                img = "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg";
                break;
        }

        const player = interaction.client.player;

        try {
            // 4. Setup Queue Anti-Mati (24/7 Mode)
            const queue = player.nodes.create(interaction.guild, {
                metadata: { channel: interaction.channel },
                selfDeaf: true,
                volume: 80,
                leaveOnEnd: false,        // JANGAN KELUAR kalau lagu habis
                leaveOnStop: false,       // JANGAN KELUAR kalau di-stop (cuma berhenti lagu)
                leaveOnEmpty: false,      // JANGAN KELUAR kalau Asep pergi (tetap stay)
                leaveOnEmptyCooldown: 0,  // Matikan timer
                skipOnNoStream: true,
            });

            if (!queue.connection) await queue.connect(channel);

            // 5. Mainkan Playlist
            const searchResult = await player.search(url, { requestedBy: interaction.user });
            
            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply("❌ Gagal memuat playlist radio.");
            }

            // Hapus antrian lama jika ada, biar langsung ganti mood
            queue.clear(); 
            
            // Tambahkan playlist baru
            await queue.addTrack(searchResult.tracks);
            
            // Mulai mainkan jika belum main
            if (!queue.isPlaying()) await queue.node.play();

            // --- KUNCI RAHASIA 24/7: REPEAT MODE ---
            // Set mode loop ke QUEUE (mengulang satu playlist terus menerus)
            queue.setRepeatMode(QueueRepeatMode.QUEUE);

            // 6. Kirim Embed Cantik
            const embed = new EmbedBuilder()
                .setTitle(`📻 Radio 24/7 Aktif: ${title}`)
                .setDescription(`Mode santai diaktifkan khusus untuk Tuan Asep.\n🔁 **Looping:** Aktif (Non-stop)\n👋 **Auto-Leave:** Mati (Standby 24 Jam)`)
                .setImage(img)
                .setColor('#FF69B4')
                .setFooter({ text: 'Ketik /stop untuk mematikan radio.' });

            await interaction.editReply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            await interaction.editReply(`❌ Error: ${e.message}`);
        }
    },
};