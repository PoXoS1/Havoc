import { GuildEmoji } from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function(emoji: GuildEmoji) {
  const guild = emoji.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(4)) return;

  guild.sendLog({
    addFields: [
      {
        name: '**📅 Timestamp of creation :**',
        value: `${emoji.createdAt.toLocaleString()} (UTC)`
      },
      { name: '** 📂 Emoji name:**', value: emoji.name },
      { name: '**🔎 Emoji URL :**', value: emoji.url }
    ],
    setColor: 'GREEN',
    setAuthor: ['Emoji was created', guild.iconURL()],
    setFooter: `Emoji ID: ${emoji.id}`
  });
}
