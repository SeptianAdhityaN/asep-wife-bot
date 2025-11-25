const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Berhenti memutar musik"),

  async execute(interaction, message, args) {
    // Ambil client dari salah satu sumber
    const client = (interaction || message).client;
    const guildId = (interaction || message).guild.id;

    const queue = client.player.nodes.get(guildId);

    if (queue) queue.delete();
    else {
      const me = (interaction || message).guild.members.me;
      if (me.voice.channel) me.voice.disconnect();
    }

    const msg = "🛑 Berhenti & Keluar.";
    return interaction ? interaction.reply(msg) : message.reply(msg);
  },
};
