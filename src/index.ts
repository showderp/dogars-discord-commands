import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import NaCl from 'tweetnacl';
import {
  DiscordInteraction,
  DiscordInteractionResponseType,
  DiscordInteractionType,
} from './discord';
import { createCommandProcessor } from './discord/commands';
import { commands } from './dogars/command';

const PUBLIC_KEY = process.env.PUBLIC_KEY as string;

const processCommand = createCommandProcessor(commands);

// eslint-disable-next-line import/prefer-default-export
export const handler: APIGatewayProxyHandlerV2 = async (
  apiGatewayEvent,
) => {
  const signature = apiGatewayEvent.headers['x-signature-ed25519'] || '';
  const timestamp = apiGatewayEvent.headers['x-signature-timestamp'] || '';

  const isVerified = NaCl.sign.detached.verify(
    Buffer.from(timestamp + apiGatewayEvent.body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex'),
  );

  if (!isVerified) {
    return {
      statusCode: 401,
    };
  }

  const interaction = JSON.parse(apiGatewayEvent.body || '{}') as DiscordInteraction;

  if (interaction.type === DiscordInteractionType.PING) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        type: DiscordInteractionResponseType.PONG,
      }),
    };
  }

  const response = await processCommand(interaction);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
