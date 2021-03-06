import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util';
import Regex from '../../util/regex';
import { Target } from '../../util/targetter';
import { PROMPT_ENTER, NOOP, EMOJIS } from '../../util/CONSTANTS';

export async function review(
  suggestionMsg: HavocMessage,
  reason: string | undefined,
  approved: boolean,
  approvedBy: string
) {
  const [embed] = suggestionMsg.embeds;
  if (
    !embed.footer?.text?.startsWith('Suggestion') ||
    suggestionMsg.author.id !== suggestionMsg.client.user?.id
  )
    return suggestionMsg.respond({
      setDescription: `**${approvedBy}** you have entered an invalid Suggestion ID.`,
      setImage: 'https://i.imgur.com/IK7JkVw.png',
    });

  if (embed.fields[1].value !== 'Open')
    return suggestionMsg.respond(
      `this suggestion has already been ${Util.captialise(
        embed.fields[1].value.split(' -')[0]
      )}.`
    );

  embed.spliceFields(1, 1, {
    name: 'Status:',
    value: `${approved ? 'Approved' : 'Denied'} by ${approvedBy}${
      reason ? ` - ${reason}` : ''
    }`,
  });
  embed.setColor(approved ? 'GREEN' : 'RED');
  await suggestionMsg.edit(embed);

  const [userID] = embed.author?.name?.match(Regex.id) || [];
  embed.setAuthor(
    `${EMOJIS.SUGGESTION}Your suggestion in ${
      suggestionMsg.guild!.name
    } has been ${approved ? 'accepted' : 'denied'}${EMOJIS.SUGGESTION}`
  );
  embed.setDescription(`\n\nClick [here](${suggestionMsg.url}) to view it.`);

  suggestionMsg.client.users
    .fetch(userID)
    .then((user) => user.send(embed))
    .catch(NOOP);
}

export async function getSuggestionMsg(message: HavocMessage) {
  if (!message.arg) return null;

  const suggestionChannel = await message.findConfigChannel('suggestion');
  if (!suggestionChannel) return null;

  const suggestionMsg = await suggestionChannel.messages
    .fetch(message.arg)
    .catch(NOOP);

  return message.shiftArg(suggestionMsg);
}

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Approves a suggestion with an optional reason.',
      aliases: ['s-approve', 'suggest-approve'],
      args: [
        {
          name: 'ID',
          example: ['5637006579059427073'],
          type: getSuggestionMsg,
          required: true,
          promptOpts: {
            initial: PROMPT_ENTER(
              "the ID of the suggestion which you can find on the footer of the suggestion's embed, followed by the reason of approval (optional)"
            ),
            invalid:
              "I couldn't find any suggestions that corresponds the ID that you entered https://i.imgur.com/IK7JkVw.png",
          },
        },
        {
          name: 'reason',
          type: Target.TEXT,
        },
      ],
      sub: true,
    });
  }

  async run({
    message,
    fn: suggestionMsg,
    text: reason,
  }: {
    message: HavocMessage;
    fn: HavocMessage;
    text?: string;
  }) {
    await message.delete();
    review(suggestionMsg, reason, true, message.author.tag);
  }
}
