import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import HavocUser from '../../extensions/User';

export default class Unban extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Unbans the inputted user from the server.',
			args: [{
				type: 'user',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to unban.' }
			},
			{
				key: 'reason',
				type: 'string',
				prompt: {
					initialMsg: 'enter the reason for the unban.',
					invalidResponseMsg: 'You need to enter a reason for the unban or you can enter `None` if you would not like to provide a reason.'
				}
			}],
			userPerms: { flags: 'BAN_MEMBERS' }
		});
	}

	public async run(this: HavocClient, { msg, target: { user, loose, reason } }: { msg: HavocMessage; target: { user: HavocUser; loose?: string; reason: string | null } }) {
		reason = reason && reason.toLowerCase() === 'none' ? null : reason;
		let response;
		const tag = loose ? user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : user.tag;
		if (user.id === msg.author.id) {
			await msg.react('463993771961483264');
			return msg.channel.send('<:WaitWhat:463993771961483264>');
		}
		if (user.id === this.user!.id) {
			await msg.react('463993771961483264');
			return msg.channel.send('<:WaitWhat:463993771961483264>');
		}
		if (response) {
			await msg.react('⛔');
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		// @ts-ignore
		// eslint-disable-next-line newline-per-chained-call
		const existing = await this.api.guilds(msg.guild.id).bans(user.id).get().catch(() => null);
		if (!existing) {
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${tag} is not banned in this server.` });
		}
		await msg.guild.members.unban(user, `Unbanned by ${msg.author.tag}${reason ? ` for the reason ${reason}` : ''}`);
		msg.guild.modlog(msg, user, reason);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have unbanned \`${user.tag}\` from \`${msg.guild.name}\`${reason ? ` for the reason ${reason}` : '.'}` });
	}
}