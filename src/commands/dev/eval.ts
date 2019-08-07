import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';
import { inspect } from 'util';

export default class Eval extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1011,
			description: 'Evals shit.',
			aliases: new Set(['ev']),
			flags: new Set(['silent', 'detailed']),
			args: [{
				type: 'string',
				key: 'code',
				prompt: { initialMsg: 'enter the code that you would like to evaluate.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, flag, target: { code } }: { msg: HavocMessage; flag: string; target: { code: string } }) {
		const start = process.hrtime.bigint();
		try {
			// eslint-disable-next-line no-eval
			let evaled = eval(code);
			if (evaled instanceof Promise) evaled = await evaled;
			const end = process.hrtime.bigint();
			const type = evaled && typeof evaled === 'object' && evaled.constructor ? evaled.constructor.name : typeof evaled;
			const output = inspect(evaled, {
				depth: 0,
				maxArrayLength: flag === 'detailed' ? Infinity : 100
			}).replace(new RegExp(this.token!, 'g'), 'no');
			if (flag !== 'silent') {
				msg.response = await msg.sendEmbed({
					setDescription: `**📥 Input**\n${Util.codeblock(code, 'js')}\n**📤 Output**\n${Util.codeblock(output, 'js')}\n${flag === 'detailed' ? `🔎 **Detailed output** ${await Util.haste(inspect(evaled, { depth: Infinity }), 'js')}\n\n` : ''}**❔ Type:** \`${type}\``,
					setFooter: [`executed in ${Number(end - start) / 1000000} milliseconds`, msg.author.pfp]
				});
			}
		} catch (error) {
			const end = process.hrtime.bigint();
			error = inspect(error, {
				depth: 0,
				maxArrayLength: 0
			});
			if (flag !== 'silent') {
				msg.response = await msg.sendEmbed({
					setDescription: `**📥 Input**\n${Util.codeblock(code, 'js')}\n**❗ Error:**\n${Util.codeblock(error)}`,
					setFooter: [`executed in ${Number(end - start) / 1000000} milliseconds`, msg.author.pfp]
				});
			}
		}
	}
}
