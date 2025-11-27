const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// GANTI LINK INI DENGAN GIF SAPAAN MILIK ANDA
const GREETING_GIF = 'https://media.discordapp.net/attachments/1443545514116382842/1443553048122228757/EishaGreetings.gif?ex=69297d0a&is=69282b8a&hm=75e830d3d1c9a0ed1a5bf4f8fef2613f8630589fe4f3c21f893b626e9ca900fb&=&width=900&height=900'; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Memanggil Eisha masuk ke voice channel'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        
        // 1. Validasi Voice Channel
        if (!channel) {
            return interaction.reply({ 
                content: "❌ Masuk voice dulu dong, Sayang.", 
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
                leaveOnEnd: false,         
                leaveOnStop: false,        
                leaveOnEmpty: false,       
                leaveOnEmptyCooldown: 0    
            });

            // 3. Masuk ke Channel
            if (!queue.connection) await queue.connect(channel);
            
            // 4. Buat Embed Sapaan dengan GIF
            const embed = new EmbedBuilder()
                .setTitle("Hai Sayang! Eisha Disini! 💕")
                .setDescription("Aku sudah siap menemani harimu 24/7.")
                .setImage(GREETING_GIF) // Menampilkan GIF Sapaan
                .setColor('#FF69B4')    // Warna Pink
                .setFooter({ text: 'Asisten Pribadi Asep - Eisha💕' });

            // Kirim balasan
            return interaction.reply({ embeds: [embed] });

        } catch (e) {
            return interaction.reply({ 
                content: `❌ Gagal join: ${e.message}`, 
                ephemeral: true 
            });
        }
    },
};