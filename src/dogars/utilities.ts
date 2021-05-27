import { DiscordEmbed } from '../discord';
import { DogarsSet } from './types';

interface Stats {
  HP?: number;
  Atk?: number;
  Def?: number;
  SpA?: number;
  SpD?: number;
  Spe?: number;
}

const statsToString = (stats: Stats, filteredValue: number) => {
  const statsString = Object.entries(stats)
    .filter(([, statValue]) => statValue !== filteredValue)
    .map(([statName, statValue]) => `${statValue} ${statName}`)
    .join(' / ');

  return statsString === '' ? undefined : statsString;
};

const setToString = (set: DogarsSet) => {
  const lines = [];

  let firstLine = '';
  firstLine += set.name && set.name !== set.species
    ? `${set.name} (${set.species})`
    : `${set.species ?? ''}`;
  firstLine += set.gender ? ` (${set.gender})` : '';
  firstLine += set.item && set.item !== '' ? ` @ ${set.item}` : '';
  if (firstLine !== '') lines.push(firstLine);

  if (set.ability) lines.push(`Ability: ${set.ability}`);
  if (set.level && set.level !== 100) lines.push(`Level: ${set.level}`);
  if (set.shiny) lines.push('Shiny: Yes');
  if (typeof set.happiness === 'number' && set.happiness < 255 && !Number.isNaN(set.happiness)) {
    lines.push(`Happiness: ${set.happiness}`);
  }
  if (set.nature) lines.push(`${set.nature} Nature`);

  const evs = {
    HP: set.hp_ev,
    Atk: set.atk_ev,
    Def: set.def_ev,
    SpA: set.spa_ev,
    SpD: set.spd_ev,
    Spe: set.spe_ev,
  };
  const evLine = statsToString(evs, 0);
  if (evLine) lines.push(`EVs: ${evLine}`);

  const ivs = {
    HP: set.hp_iv,
    Atk: set.atk_iv,
    Def: set.def_iv,
    SpA: set.spa_iv,
    SpD: set.spd_iv,
    Spe: set.spe_iv,
  };
  const ivLine = statsToString(ivs, 31);
  if (ivLine) lines.push(`IVs: ${ivLine}`);

  const moves = [set.move_1, set.move_2, set.move_3, set.move_4].filter((move) => move);

  if (moves.length > 0) {
    lines.push(...moves.map((move) => `- ${move}`));
  }

  return lines.join('\n');
};

export const createErrorEmbed = (message: string): DiscordEmbed => ({
  color: 16711680,
  description: message,
});

const toId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

const getNormalizedUniqueName = (species: string) => {
  const h = species.indexOf('-');
  if (h === -1) {
    return toId(species);
  }

  if (species.toLowerCase() === 'kommo-o') {
    return 'kommoo';
  }

  return `${toId(species.substr(0, h).toLowerCase())}-${toId(species.substr(h + 1))}`;
};

const getPokemonImage = (set: DogarsSet) => `https://play.pokemonshowdown.com/sprites/xyani${(set.shiny && '-shiny') || ''}/${getNormalizedUniqueName(set.species)}.gif`;

export const createSetEmbed = (set: DogarsSet): DiscordEmbed => {
  const setText = setToString(set);
  const author = `${set.creator || 'Anonymous'} ${set.hash ? ` !${set.hash}` : ''}`;
  const params = new URLSearchParams();

  params.set('page', '1');

  if (set.creator) {
    params.set('creator', set.creator);
  }

  if (set.hash) {
    params.set('hash', set.hash);
  }

  const authorLink = `https://dogars.org/results?${params.toString()}`;

  const timestamp = typeof set.date_added === 'string'
    ? parseInt(set.date_added, 10)
    : set.date_added;

  const embed: DiscordEmbed = {
    color: 13521614,
    title: set.name || set.species,
    author: {
      name: author,
      icon_url: 'https://dogars.org/img/icons/favicon-32x32.png',
      url: (set.creator || set.hash) ? authorLink : undefined,
    },
    url: `https://dogars.org/set/${set.id}`,
    thumbnail: {
      url: getPokemonImage(set),
    },
    image: {
      url: `https://dogars.org/api/custom/${set.id}`,
    },
    timestamp: new Date(timestamp).toISOString(),
    footer: {
      text: `Format: ${set.format}`,
    },
    fields: [],
  };

  if (set.description) {
    embed.fields?.push({
      name: 'Description',
      value: set.description,
    });
  }

  embed.fields?.push({
    name: 'Set',
    value: `\`\`\`${setText}\`\`\``,
  });

  return embed;
};
