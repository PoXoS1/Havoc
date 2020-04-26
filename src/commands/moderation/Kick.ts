import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import HavocGuildMember from '../../structures/extensions/HavocGuildMember';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Kicks the inputted member from the server (with an optional reason).',
      flags: ['force', 'f'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt: PROMPT_INITIAL[Target.MEMBER]('you would like to kick')
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'KICK_MEMBERS'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      member,
      text: reason,
      flags
    }: {
      message: HavocMessage;
      member: HavocGuildMember;
      text: string;
      flags: { force?: undefined; f?: undefined };
    }
  ) {
    if (member.id === message.author.id) {
      await message.safeReact('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }
    if (member.id === this.user!.id) {
      await message.safeReact('😢');
      return message.channel.send('😢');
    }

    const response = message.member.can('kick', member);
    if (response) {
      await message.safeReact('⛔');
      return message.respond(response);
    }

    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `kick \`${member.user.tag}\` from \`${message.guild!.name}\``
      ))
    ) {
      await member.kick(
        `Kicked by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`
      );
      message.sendEmbed({
        setDescription: `**${message.author.tag}** I have kicked \`${
          member.user.tag
        }\` from \`${message.guild!.name}\`${
          reason ? ` for the reason ${reason}` : '.'
        } <:boot3:402540975605678081>`
      });
    }
  }
}
