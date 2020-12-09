import { App, ExpressReceiver } from '@slack/bolt';
import awsServerlessExpress from 'aws-serverless-express';
import { APIGatewayEvent, Context } from 'aws-lambda';

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver: expressReceiver,
  processBeforeResponse: true,
});

// Listen for a slash command invocation
app.command('/start-incident', async ({ ack, payload, context }: any) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Go ahead. Click it.',
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Click me!',
            },
            action_id: 'button_abc',
          },
        },
      ],
      // Text in the notification
      text: 'Message from Test App',
    });
    // eslint-disable-next-line no-console
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

// Listen for a button invocation with action_id `button_abc`
// You must set up a Request URL under Interactive Components on your app configuration page
app.action('button_abc', async ({ ack, body, context }: any) => {
  // Acknowledge the button request
  ack();

  try {
    // Update the message
    const result = await app.client.chat.update({
      token: context.botToken,
      // ts of message to update
      ts: body.message.ts,
      // Channel of message
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*The button was clicked!*',
          },
        },
      ],
      text: 'Message from Test App',
    });
    // eslint-disable-next-line no-console
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

const server = awsServerlessExpress.createServer(expressReceiver.app);

export const handler = (event: APIGatewayEvent, context: Context) => {
  awsServerlessExpress.proxy(server, event, context);
};
