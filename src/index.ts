import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import NaCl from 'tweetnacl';
import {
  DiscordInteraction,
  DiscordInteractionResponseType,
  DiscordInteractionType,
} from './discord';
import { createCommandProcessor } from './discord/commands';
import { commands } from './discord-commands';

const PUBLIC_KEY = process.env.PUBLIC_KEY as string;

const processCommand = createCommandProcessor(commands);

// eslint-disable-next-line import/prefer-default-export
export const handler: APIGatewayProxyHandlerV2 = async (
  apiGatewayEvent,
  context,
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

  console.log(`[Request ${context.awsRequestId}] Received interaction: ${apiGatewayEvent.body}`);

  const interaction = JSON.parse(apiGatewayEvent.body || '{}') as DiscordInteraction;

  if (interaction.type === DiscordInteractionType.PING) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        type: DiscordInteractionResponseType.PONG,
      }),
    };
  }

  console.time(`[Request ${context.awsRequestId}] Command processing time`);
  const response = await processCommand(interaction);
  console.timeEnd(`[Request ${context.awsRequestId}] Command processing time`);

  console.log(`[Request ${context.awsRequestId}] Responding with: ${JSON.stringify(response)}`);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
