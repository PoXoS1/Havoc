import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util/Util';
import HavocUser from '../../structures/extensions/HavocUser';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: "View the your / inputted member's warning(s) in the guild.",
      aliases: ['warnlog', 'warns', 'wl'],
      args: {
        required: true,
        type: Target.USER,
        prompt:
          "mention the user / enter the user's ID, or tag of whose warnings you would like to view."
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user
    }: {
      message: HavocMessage;
      user: HavocUser;
    }
  ) {
    const guild = await this.db.guildRepo.findOne(
      { id: message.guild!.id, warns: { id: user.id } },
      { populate: ['warns'] }
    );
    const warns = guild?.warns.getItems().find(({ id }) => id === user.id);
    if (!warns)
      return message.respond(
        `\`${user.tag}\` doesn't have any warnings in this server.`
      );

    message.paginate({
      title: `${user.tag}'s warns`,
      descriptions: await Promise.all(
        warns.history.map(async ({ at, warner, reason }, i) =>
          Util.stripBlankLines(`**Warn:** ${i + 1}
            **Warned By:** ${(await this.users.fetch(warner)).tag}
            **Warned At:** ${at.toLocaleString()}
            ${reason ? `**Reason:** ${reason}` : ''}`)
        )
      ),
      thumbnails: Array(warns.history.length).fill(user.pfp),
      maxPerPage: 1,
      page: Number(message.arg)
    });
  }
}