import {
  advancedSearchSets,
  getRandomSetId,
  getSet,
  searchSets,
} from './api';
import {
  Command,
  Commands,
  DiscordInteractionDataValueType,
  DiscordInteractionResponseType,
  getValues,
} from '../discord';
import { createErrorEmbed, createSetEmbed } from './utilities';
import { DogarsQuery } from './types';

interface GetSetByIdOptions {
  set: string;
}

export const getSetByIdCommand: Command = ({
  processor: async (interaction, options) => {
    const { set: setQuery } = getValues<GetSetByIdOptions>(
      { set: { type: DiscordInteractionDataValueType.STRING, required: true } },
      options,
    );

    if (setQuery) {
      const setNumber = parseInt(setQuery, 10);

      if (Number.isNaN(setNumber)) {
        const setPage = await searchSets(setQuery);

        if (setPage) {
          const [, sets] = setPage;

          if (sets[0]) {
            return {
              type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [createSetEmbed(sets[0])],
              },
            };
          }
        }
      } else {
        const set = await getSet(setNumber);

        if (set) {
          return {
            type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [createSetEmbed(set)],
            },
          };
        }
      }
    }

    throw new Error('meme');
  },
});

export const getRandomSetCommand: Command = ({
  processor: async () => {
    const setId = await getRandomSetId();

    if (setId) {
      const set = await getSet(setId);

      if (set) {
        return {
          type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [createSetEmbed(set)],
          },
        };
      }

      return {
        type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [createErrorEmbed('Unable to find a random set')],
        },
      };
    }

    return {
      type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [createErrorEmbed('Unable to find a random set')],
      },
    };
  },
});

interface AdvancedSearchSetOptions {
  format?: string;
  creator?: string;
  tripcode?: string;
  name?: string;
  species?: string;
  item?: string;
  ability?: string;
  level?: number;
  random?: boolean;
}

const optionToQuery: { [key in keyof AdvancedSearchSetOptions]: DogarsQuery } = {
  format: 'format',
  creator: 'creator',
  tripcode: 'hash',
  name: 'name',
  species: 'species',
  item: 'item',
  ability: 'ability',
  level: 'level',
};

export const advancedSearchSetCommand: Command = ({
  processor: async (interaction, options) => {
    const values = getValues<AdvancedSearchSetOptions>(
      {
        format: { type: DiscordInteractionDataValueType.STRING, required: false },
        creator: { type: DiscordInteractionDataValueType.STRING, required: false },
        tripcode: { type: DiscordInteractionDataValueType.STRING, required: false },
        name: { type: DiscordInteractionDataValueType.STRING, required: false },
        species: { type: DiscordInteractionDataValueType.STRING, required: false },
        item: { type: DiscordInteractionDataValueType.STRING, required: false },
        ability: { type: DiscordInteractionDataValueType.STRING, required: false },
        level: { type: DiscordInteractionDataValueType.STRING, required: false },
        random: { type: DiscordInteractionDataValueType.BOOLEAN, required: false },
      },
      options,
    );

    const queries: Partial<{ [key in DogarsQuery]: string }> = Object.entries(values).reduce(
      (query, [name, value]) => {
        const key = optionToQuery[name as keyof AdvancedSearchSetOptions];
        if (key) {
          return {
            ...query,
            [key]: value,
          };
        }

        return query;
      },
      {},
    );

    const setPage = await advancedSearchSets(
      queries,
      values.random === true,
    );

    if (setPage) {
      const [, sets] = setPage;

      if (sets[0]) {
        return {
          type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [createSetEmbed(sets[0])],
          },
        };
      }
    }

    throw new Error('meme');
  },
});

export const commands: Commands = {
  data: getSetByIdCommand,
  randpoke: getRandomSetCommand,
  dexsearch: advancedSearchSetCommand,
};
