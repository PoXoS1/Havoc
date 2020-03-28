import HavocMessage from './extensions/HavocMessage';
import { Message } from 'discord.js';
import { Target } from '../util/Targetter';
import Logger from '../util/Logger';

export interface EmbedPaginationOptions {
  message: HavocMessage;
  title: string;
  descriptions: string[];
  maxPerPage: number;
  page?: number;
  thumbnails?: string[];
}

export default class {
  message: HavocMessage;

  title: string;

  descriptions: string[];

  maxPerPage: number;

  page: number;

  thumbnails: string[];

  embed!: Message;

  attached?: string;

  constructor(options: EmbedPaginationOptions) {
    this.message = options.message;
    this.title = options.title;
    this.descriptions = options.descriptions;
    this.maxPerPage = options.maxPerPage;
    this.page = options.page || 1;
    this.thumbnails = options.thumbnails || [];
    this.setup();
  }

  get totalPages() {
    return Math.ceil(this.descriptions.length / this.maxPerPage);
  }

  pageEmbed(page: number, paginate: boolean = true) {
    const embed = this.message.constructEmbed({
      setTitle: `${this.title}${
        paginate ? ` - Page ${page} of ${this.totalPages}` : ''
      }`,
      setDescription: `${this.descriptions
        .slice(page * this.maxPerPage - this.maxPerPage, page * this.maxPerPage)
        .join('\n')}`,
      setThumbnail: this.thumbnails[this.page - 1]
    });
    return embed;
  }

  async attach(send = true) {
    if (this.attached) {
      if (
        send &&
        this.message.channel.lastMessage?.embeds[0]?.description !==
          this.attached
      )
        return this.message.respond({ setDescription: this.attached });
    } else {
      this.attached = await this.message.channel
        .send({
          files: [
            {
              attachment: Buffer.from(
                `${this.title}\n\n\n${this.descriptions.join('\n')}`,
                'utf8'
              ),
              name: `${this.title}.txt`
            }
          ]
        })
        .then(msg => msg.url);
    }
  }

  async setup() {
    let emojis = ['⏮', '◀', '⬇', '▶', '⏭', '📜', '✅'];
    if (this.totalPages === 1)
      return this.message.channel.send(this.pageEmbed(this.page, false));
    this.embed = await this.message.channel.send(this.pageEmbed(this.page));
    for (const emoji of emojis) await this.embed.react(emoji);
    const collector = this.embed.createReactionCollector(
      (reaction, user) =>
        emojis.includes(reaction.emoji.name) &&
        user.id === this.message.author.id,
      { time: 100000 }
    );
    for await (const reaction of collector) {
      switch (reaction.emoji.name) {
        case '⏮':
          if (this.page !== 1)
            await this.embed.edit(this.pageEmbed((this.page = 1)));
          break;
        case '◀':
          if (this.page > 1) await this.embed.edit(this.pageEmbed(--this.page));
          break;
        case '⬇':
          await this.message
            .createPrompt({
              initialMsg: 'enter the page you like to jump to.',
              invalidMsg: `You need to enter a number between 1 to ${this.totalPages}, e.g: entering \`2\` will jump to page 2.`,
              target: (message: HavocMessage) => {
                const number = Number(message.content);
                if (number && number <= this.totalPages) return number;
              }
            })
            .then(response => {
              const page = response[Target.FUNCTION];
              if (Number.isInteger(page)) {
                this.page = page;
                this.embed.edit(this.pageEmbed(page));
              }
            })
            .catch(err => Logger.error('EmbedPagination#setup()', err));
          break;
        case '▶':
          if (this.page < this.totalPages)
            await this.embed.edit(this.pageEmbed(++this.page));
          break;
        case '⏭':
          if (this.page !== this.totalPages)
            await this.embed.edit(
              this.pageEmbed((this.page = this.totalPages))
            );
          break;
        case '📜':
          await this.attach();
          break;
        case '✅':
          collector.stop();
          break;
      }
      await reaction.users.remove(this.message.author);
    }
    if (!this.embed.deleted) await this.embed.reactions.removeAll();
    await this.attach(false);
    this.embed.edit(
      this.embed.embeds[0].setTitle(this.title).setDescription(this.attached)
    );
  }
}