import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember } from 'discord.js';
import Util from '../../util/Util';

export default class WarnClear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Clears all warnings from the inputted member.',
			aliases: new Set(['warnc', 'clearwarnings', 'cwarns', 'cwarnings']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username whose warnings you would like to clear.' }
			}],
			userPerms: { flags: 'ADMINISTRATOR' }
		});
	}

	public async run(this: HavocClient, { msg, target: { member, loose } }: { msg: HavocMessage; target: { member: GuildMember; loose?: string } }) {
		let response;
		const tag = loose ? member.user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : member.user.tag;
		const role = member.roles.highest;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to clear warnings from this member.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to clear warnings from this member.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		this.db.category = 'warn';
		const key = member.id + msg.guild.id;
		const amount = (await this.db.get(key) || []).length;
		if (!amount) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** \`${member.user.tag}\` doesn't have any warnings in this server.` });
		}
		await this.db.delete(key);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have cleared ${amount} ${Util.plural('warning', amount)} from \`${member.user.tag}\`.` });
		msg.guild.modlog(msg, member);
	}
}
