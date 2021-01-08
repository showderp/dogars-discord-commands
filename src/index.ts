import { APIGatewayProxyHandlerV2, SQSHandler } from 'aws-lambda';
import { SQS } from 'aws-sdk';
import NaCl from 'tweetnacl';
import {
  createCommandProcessor,
  DiscordInteraction,
  DiscordInteractionResponse,
  DiscordInteractionResponseType,
  DiscordInteractionType,
  editOriginalMessage,
} from './discord';
import { commands } from './discord-commands';

const APPLICATION_ID = process.env.APPLICATION_ID as string;
const PUBLIC_KEY = process.env.PUBLIC_KEY as string;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL as string;

const processCommand = createCommandProcessor(commands);

// eslint-disable-next-line import/prefer-default-export
export const acknowledgeHandler: APIGatewayProxyHandlerV2 = async (
  apiGatewayEvent,
  context,
) => {
  if (apiGatewayEvent.body === 'warm') {
    return {
      statusCode: 204,
    };
  }

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

  const sqsClient = new SQS();
  await sqsClient.sendMessage({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: apiGatewayEvent.body || '{}',
  }).promise();

  const loadingResponse: DiscordInteractionResponse = {
    type: DiscordInteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [{
        color: 16776960,
        description: 'Awaiting response...',
      }],
    },
  };

  return {
    statusCode: 200,
    body: JSON.stringify(loadingResponse),
  };
};

export const responseHandler: SQSHandler = async (
  sqsEvent,
  context,
) => {
  await Promise.all(sqsEvent.Records
    .map((record) => record.body)
    .map((rawInteraction) => JSON.parse(rawInteraction) as DiscordInteraction)
    .map(async (interaction) => {
      console.time(`[Request ${context.awsRequestId}] Command processing time`);
      const response = await processCommand(interaction);
      console.timeEnd(`[Request ${context.awsRequestId}] Command processing time`);

      if (response) {
        console.time(`[Request ${context.awsRequestId}] Sent follow up message`);
        await editOriginalMessage(APPLICATION_ID, interaction.token, response);
        console.timeEnd(`[Request ${context.awsRequestId}] Sent follow up message`);
      } else {
        console.error(`[Request ${context.awsRequestId}] Error parsing command`);
      }
    }));
};
