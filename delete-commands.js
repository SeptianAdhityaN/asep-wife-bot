require('dotenv').config();
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID; // Pastikan ini ada di .env
const guildId = process.env.GUILD_ID;   // Pastikan ini ada di .env

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log('🗑️  Sedang menghapus semua slash commands...');

		// 1. Hapus Command di Server Tertentu (Guild)
        // Kita kirim array kosong [] yang artinya "hapus semua"
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: [] },
		);
        console.log('✅ Command di Server (Guild) berhasil dihapus.');

		// 2. Hapus Command Global (Jika pernah terdaftar)
        // Ini butuh waktu sekitar 1 jam untuk update di semua server, tapi kita hapus saja biar aman.
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: [] },
		);
		console.log('✅ Command Global berhasil dihapus.');
        
        console.log('🎉 Selesai! Menu slash (/) sudah bersih.');

	} catch (error) {
		console.error(error);
	}
})();