import {
  DiscordInteraction,
  DiscordInteractionDataOption,
  DiscordInteractionDataValueType,
  DiscordInteractionResponse,
  DiscordInteractionResponseType,
} from './types';

const matchesType = (valueConfiguration: ValueConfiguration, value?: any) => {
  const { type, required } = valueConfiguration;

  if (value === undefined) {
    return !required;
  }

  return (type === DiscordInteractionDataValueType.BOOLEAN && (typeof value === 'boolean'))
    || (type === DiscordInteractionDataValueType.NUMBER && (typeof value === 'number'))
    || (type === DiscordInteractionDataValueType.STRING && (typeof value === 'string'));
};

interface ValueConfiguration {
  type: DiscordInteractionDataValueType,
  required: boolean,
}

export const getValues = <T>(
  keys: { [key in keyof T]: ValueConfiguration },
  options: DiscordInteractionDataOption[],
): Partial<T> => options.reduce((result, option) => {
    const valueConfiguration = keys[option.name as keyof T];
    if (valueConfiguration) {
      if (matchesType(valueConfiguration, option.value)) {
        return {
          ...result,
          [option.name]: option.value,
        };
      }
    }

    return result;
  }, {});

export type CommandProcessor = (
  interaction: DiscordInteraction,
  options: DiscordInteractionDataOption[],
) => Promise<DiscordInteractionResponse>;

export type Command = { processor: CommandProcessor } | { subCommands: Commands };

export interface Commands {
  [commandName: string]: Command;
}

const processCommand = async (
  interaction: DiscordInteraction,
  command: Command,
  options?: DiscordInteractionDataOption[],
): Promise<DiscordInteractionResponse> => {
  if ('subCommands' in command) {
    const subCommandOption = options?.find((option) => option.options);

    if (subCommandOption) {
      const subCommand = command.subCommands[subCommandOption.name];

      if (subCommand) {
        return processCommand(interaction, subCommand, subCommandOption.options);
      }
    }

    return {
      type: DiscordInteractionResponseType.ACKNOWLEDGE,
    };
  }
  return command.processor(interaction, options || []);
};

export const createCommandProcessor = (commands: Commands) => (interaction: DiscordInteraction) => {
  if (interaction.data) {
    const { name } = interaction.data;
    const command = commands[name];

    if (command) {
      return processCommand(interaction, command, interaction.data.options);
    }

    throw new Error(`No command ${interaction.data.name} available`);
  }

  throw new Error('No data available on interaction');
};
