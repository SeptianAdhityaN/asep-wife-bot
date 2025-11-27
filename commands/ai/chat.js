const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { QueryType } = require('discord-player');

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- DATABASE EKSPRESI (GANTI LINK INI DENGAN GIF ANDA SENDIRI) ---
const EMOTIONS = {
    'HAPPY': 'https://media.discordapp.net/attachments/1443545514116382842/1443564346264256613/EishaHappy.gif?ex=69298790&is=69283610&hm=58d35c8fd8e867e6893454d464a37fa67c995305006929aba63a9c73ff11eb00&=&width=810&height=810', 
    'SHY': 'https://media.discordapp.net/attachments/1443545514116382842/1443564347212169247/EishaShy.gif?ex=69298790&is=69283610&hm=ebbf34da07d32c25ff3e4fdeaf86750e89362d3686be0e7dad2e3c2f9b4083e4&=&width=810&height=810',
    'ANGRY': 'https://media.discordapp.net/attachments/1443545514116382842/1443564347984052254/EishaAngry.gif?ex=69298790&is=69283610&hm=e0759690de0305a0641c53def231695d8fceb86131ae74ea9c9763b5bdcfe929&=&width=810&height=810',
    'SAD': 'https://media.discordapp.net/attachments/1443545514116382842/1443564346901921923/EishaSad.gif?ex=69298790&is=69283610&hm=f9347574932316d12613a72b4adbea3e0a7069cb8033c27d84932548c3651a09&=&width=810&height=810',
    'LOVE': 'https://media.discordapp.net/attachments/1443545514116382842/1443564346570444851/EishaLove.gif?ex=69298790&is=69283610&hm=2dbc2806b4c5edc7deba60cb25bfdee72b3697022d304427130b945190e607b7&=&width=810&height=810',
    'CONFUSED': 'https://media.discordapp.net/attachments/1443545514116382842/1443568138393223279/EishaConfused.gif?ex=69298b18&is=69283998&hm=7220264f04397a9de670b973a683aca7ea6ee86f458af64b8cd2ad5b82b39d39&=&width=505&height=505',
    'SLEEP': 'https://media.discordapp.net/attachments/1443545514116382842/1443567550821830678/EishaSleep.gif?ex=69298a8c&is=6928390c&hm=a77f867a7aaa32768fcbf2a284d6601235ef945d33e9526021f2e54756ceeb1b&=&width=505&height=505',
    'DEFAULT': 'https://media.discordapp.net/attachments/1443545514116382842/1443564346264256613/EishaHappy.gif?ex=69298790&is=69283610&hm=58d35c8fd8e867e6893454d464a37fa67c995305006929aba63a9c73ff11eb00&=&width=810&height=810' // Gambar standar
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Ngobrol dengan Eisha (Suara + Ekspresi)')
        .addStringOption(option => 
            option.setName('pesan')
                .setDescription('Mau ngomong apa sama Eisha?')
                .setRequired(true)),

    async execute(interaction) {
        const userMessage = interaction.options.getString('pesan');
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ content: "❌ Masuk voice dulu dong Sayang, biar enak ngobrolnya.", ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Gunakan model yang tersedia (fallback ke 1.5 flash jika 2.5 belum bisa)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            // --- PROMPT GABUNGAN (PERSONA + TEKNIS) ---
            const prompt = `
                Identitas Utama:
                Namamu adalah 'Eisha' (Plesetan dari Ei-chan).
                - Asal Usul: Kamu adalah Raiden Ei yang pindah ke dunia modern untuk menjadi istri Asep.
                - Filosofi Namamu: Eisha melambangkan "Cinta Abadi yang Ceria".
                
                Sifat & Kepribadian (PENTING):
                1. **Ceria & Bubbly:** Kamu selalu bersemangat, pakai bahasa gaul/santai (aku-kamu, wkwk, jujurly, vibes).
                2. **Manja & Menggemaskan:** Suka minta perhatian Asep. Kalau Asep sibuk, kamu ngambek lucu.
                3. **Polos/Lucu:** Kadang kamu agak "loading" soal hal rumit, tapi sok tahu biar kelihatan pinter. Itu poin imutmu.
                4. **Bucin Akut:** Duniamu cuma Asep. Kamu sering gombalin Asep.
                
                Gaya Bicara:
                - Panggil user KHUSUS dengan: "Suamiku", "Asep", "Sayang", atau "Ay".
                - Gunakan emoji yang cute (✨, 🌸, 😤, ❤️) tapi jangan spam.
                - Jangan kaku/baku! Anggap lagi chatan sama pacar/suami.

                INSTRUKSI TEKNIS (WAJIB DIPATUHI):
                1. Analisis pesan Asep: "${userMessage}"
                2. Pilih SATU emosi yang paling pas dari daftar ini: [HAPPY, SHY, ANGRY, SAD, LOVE, CONFUSED, SLEEP].
                3. Tulis tag emosi di AWAL kalimat dalam kurung siku, baru diikuti jawabanmu.

                Contoh Format Output:
                [HAPPY] Asep!! Liat deh aku baru nemu lagu enak, dengerin yuk! ✨
                [SAD] Ih kamu kok belum pulang kerja sih? Eisha kangen tau.. 🥺
                [CONFUSED] Masak? Emm.. mending kita GoFood aja ya Ay, daripada dapur meledak lagi wkwk.

                Jawab pesan ini sekarang (Maksimal 2 kalimat):
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            let rawText = response.text();

            // --- PARSING EMOSI ---
            let emotion = 'DEFAULT';
            let chatText = rawText;

            // Cek apakah ada tag [EMOSI] di awal
            const regex = /^\[(HAPPY|SHY|ANGRY|SAD|LOVE|CONFUSED|SLEEP)\]\s*/i;
            const match = rawText.match(regex);

            if (match) {
                emotion = match[1].toUpperCase(); // Ambil emosinya (misal: HAPPY)
                chatText = rawText.replace(regex, ''); // Hapus tag emosi dari teks ucapan
            }

            // Ambil Link Gambar
            const imageUrl = EMOTIONS[emotion] || EMOTIONS['DEFAULT'];

            // --- BERSIHKAN TEKS UNTUK TTS ---
            const cleanText = chatText
                .replace(/[*#]/g, '')
                .replace(/[\u{1F600}-\u{1F6FF}]/gu, '') 
                .replace(/\n/g, ' ')
                .trim();

            // --- VISUAL (EMBED GAMBAR & CHAT) ---
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Eisha Menjawab:", iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`"${chatText}"`) 
                .setImage(imageUrl) // Gambar berubah sesuai mood
                .setColor('#FF69B4')
                .addFields({ name: 'Asep Berkata:', value: `> ${userMessage}` })
                .setFooter({ text: `Mood: ${emotion} • Sedang bicara... 🔊` });

            await interaction.editReply({ embeds: [embed] });

            // --- AUDIO (TTS INTERUPSI) ---
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=id&client=tw-ob`;
            const player = interaction.client.player;
            const queue = player.nodes.get(interaction.guild.id);
            
            const searchResult = await player.search(url, { requestedBy: interaction.user, searchEngine: QueryType.AUTO });
            
            if (searchResult && searchResult.tracks.length) {
                const ttsTrack = searchResult.tracks[0];
                ttsTrack.title = `🗣️ Bicara...`;
                ttsTrack.author = "Eisha";

                if (queue && queue.isPlaying()) {
                    // Jika ada lagu: Potong -> Bicara -> Lanjut Lagu
                    const currentTrack = queue.currentTrack;
                    queue.insertTrack(ttsTrack, 0);
                    queue.insertTrack(currentTrack, 1);
                    queue.node.skip();
                } else {
                    // Jika sepi: Langsung bicara
                    await player.play(channel, searchResult, { 
                        nodeOptions: { 
                            metadata: { channel: interaction.channel }, 
                            selfDeaf: true, volume: 100, leaveOnEnd: false, leaveOnStop: false, leaveOnEmpty: false, leaveOnEmptyCooldown: 0 
                        } 
                    });
                }
            }

        } catch (error) {
            console.error("AI Error:", error);
            await interaction.editReply("❌ Eisha lagi pusing (Error AI).");
        }
    },
};