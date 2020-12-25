export enum DiscordInteractionDataValueType {
  STRING,
  NUMBER,
  BOOLEAN,
}

export interface DiscordInteractionDataOption {
  name: string;
  value?: string | number | boolean;
  options?: DiscordInteractionDataOption[];
}

export interface DiscordInteractionData {
  id: string;
  name: string;
  options?: DiscordInteractionDataOption[];
}

export enum DiscordPremiumType {
  NONE = 1,
  NITRO_CLASSIC = 1,
  NITRO = 2,
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: DiscordPremiumType;
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
}

export enum DiscordInteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
}

export interface DiscordInteraction {
  id: string;
  type: DiscordInteractionType;
  data?: DiscordInteractionData;
  guild_id: string;
  channel_id: string;
  member: DiscordGuildMember;
  token: string;
  version: 1;
}

export enum DiscordInteractionResponseType {
  PONG = 1,
  ACKNOWLEDGE = 2,
  CHANNEL_MESSAGE = 3,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  ACKNOWLEDGE_WITH_SOURCE = 5,
}

export enum DiscordAllowedMentionTypes {
  ROLES = 'roles',
  USERS = 'users',
  EVERYONE = 'everyone',
}

export interface DiscordAllowedMentions {
  parse: DiscordAllowedMentionTypes[],
  roles: string[];
  users: string[];
  replied_user: boolean;
}

export interface DiscordEmbedImage {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name?: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedImage;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface DiscordInteractionResponseData {
  tts?: boolean;
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: DiscordAllowedMentions;
}

export interface DiscordInteractionResponse {
  type: DiscordInteractionResponseType;
  data?: DiscordInteractionResponseData;
}
