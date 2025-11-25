const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Istri Asep Berbicara')
        .addStringOption(option => option.setName('text').setDescription('Text').setRequired(true)),

	async execute(interaction, message, args) {
        let text, channel, member, textChannel;

        if (interaction) {
            text = interaction.options.getString("text");
            channel = interaction.member.voice.channel;
            member = interaction.member;
            textChannel = interaction.channel;
            await interaction.reply({ content: "🗣️ Mengucapkan...", flags: InteractionFlags.Ephemeral
 });
        } else {
            text = args.join(" ");
            channel = message.member.voice.channel;
            member = message.member;
            textChannel = message.channel;
        }

        if (!channel) return; // Silent fail kalau gak di voice

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
        
        const player = (interaction || message).client.player;
        await player.play(channel, url, { 
            nodeOptions: { metadata: { channel: textChannel }, leaveOnEnd: false } 
        });
	},
};