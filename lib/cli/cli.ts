export interface CommandArgs {
  _: string[]; // for positional arguments
  [key: string]: string | boolean | string[];
}
export type CommandHandler = (args: CommandArgs) => Promise<string>;

class CLI {
  private commands: Map<string, CLI | CommandHandler> = new Map();

  register(path: string | string[], handler: CommandHandler): void {
    const parts = Array.isArray(path) ? path : path.trim().split(/\s+/);
    this._registerRecursive(parts, handler);
  }

  run(input: string): string | Promise<string> {
    const tokens = this.tokenize(input);
    if (tokens.length === 0) return "";

    return this._runRecursive(tokens);
  }

  private _registerRecursive(path: string[], handler: CommandHandler): void {
    const [head, ...tail] = path;

    if (!head) throw new Error("Invalid command path");

    if (tail.length === 0) {
      this.commands.set(head, handler);
    } else {
      if (
        !this.commands.has(head) ||
        !(this.commands.get(head) instanceof CLI)
      ) {
        this.commands.set(head, new CLI());
      }
      const subCli = this.commands.get(head) as CLI;
      subCli._registerRecursive(tail, handler);
    }
  }

  private _runRecursive(tokens: string[]): string | Promise<string> {
    const [head, ...tail] = tokens;
    const command = this.commands.get(head);

    if (!command) {
      console.error(`Unknown command: ${head}`);
      return `Unknown command: ${head}`;
    }

    if (typeof command === "function") {
      const args = this.parseArgs(tail);
      return command(args);
    } else {
      return command._runRecursive(tail);
    }
  }

  private tokenize(input: string): string[] {
    const regex = /[^\s"]+|"([^"]*)"/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      tokens.push(match[1] ?? match[0]);
    }

    return tokens;
  }

  private parseArgs(tokens: string[]): CommandArgs {
    const args: CommandArgs = { _: [] };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.startsWith("--")) {
        const key = token.slice(2);
        const next = tokens[i + 1];
        if (!next || next.startsWith("-")) {
          args[key] = true;
        } else {
          args[key] = next;
          i++;
        }
      } else if (token.startsWith("-")) {
        const key = token.slice(1);
        const next = tokens[i + 1];
        if (!next || next.startsWith("-")) {
          args[key] = true;
        } else {
          args[key] = next;
          i++;
        }
      } else {
        args._.push(token); // ← collect positional arguments
      }
    }

    return args;
  }
}

export { CLI };
