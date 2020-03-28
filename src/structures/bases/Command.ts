import Havoc from '../../client/Havoc';
import { Target, Targets, TargetType, TargetFn } from '../../util/Targetter';
import HavocMessage from '../extensions/HavocMessage';
import Util from '../../util/Util';

interface Arg {
  type: TargetType;
  required?: boolean;
  prompt?: string;
  promptOpts?: {
    initial: string;
    invalid: string;
  };
}

interface CommandOptions {
  aliases?: Set<string> | string[];
  description: string;
  args?: Arg | Arg[];
}

export type CommandParams = {
  [target in Target]?: Targets[target] | null;
} & {
  target?: TargetFn;
  message: HavocMessage;
};

export default abstract class implements CommandOptions {
  name!: string;

  category!: string;

  aliases: Set<string>;

  description: CommandOptions['description'];

  args: Arg[];

  constructor(__path: string, options: CommandOptions) {
    // @ts-ignore
    const { groups } = __path.match(
      /[\\/](?<category>[a-z]+)[\\/](?<name>[a-z]+)\.js/i
    );
    Object.assign(this, groups);
    this.aliases = new Set(options.aliases);
    this.description = options.description;
    this.args = Util.arrayify(options.args);
  }

  abstract async run(this: Havoc, params: CommandParams): Promise<void>;
}
