import Havoc from '../../client/Havoc';
import { Target, Targets, TargetType, TargetFn } from '../../util/targetter';
import HavocMessage from '../extensions/HavocMessage';
import Util from '../../util';
import { parse, sep } from 'path';
import { PermissionString, Message } from 'discord.js';

export interface Arg {
  type: TargetType;
  name?: string;
  required?: boolean;
  example?: string[];
  prompt?: string | ((message: HavocMessage) => string);
  promptOpts?: {
    initial: string;
    invalid: string;
  };
}

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
  promptOnly?: boolean;
  sub?: boolean;
  dm?: boolean;
  args?: Arg | Arg[];
  flags?: string[];
  requiredPerms?: PermissionString | PermissionString[];
}

export type CommandParams = {
  [target in Target]?: Targets[target] | null;
} & {
  target?: TargetFn;
  message: HavocMessage;
};

export enum Status {
  SUBCOMMAND,
  RAN,
  ERROR,
}

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  flags: string[];

  description: CommandOptions['description'];

  requiredPerms?: CommandOptions['requiredPerms'];

  promptOnly: boolean;

  args: Arg[];

  sub: boolean;

  dm: boolean;

  constructor(__path: string, options: CommandOptions) {
    const { name, dir } = parse(__path);
    this.name = name.toLowerCase();
    this.category = dir.split(sep).pop()!;
    this.aliases = new Set(options.aliases);
    this.flags = options.flags ?? [];
    this.description = options.description;
    this.requiredPerms = options.requiredPerms;
    this.promptOnly = options.promptOnly ?? false;
    this.args = Util.arrayify(options.args) as Arg[] | [];
    this.sub = options.sub ?? false;
    this.dm = options.dm ?? false;
  }

  abstract async run(
    this: Havoc,
    params: CommandParams
  ): Promise<void | HavocMessage | Message>;
}
