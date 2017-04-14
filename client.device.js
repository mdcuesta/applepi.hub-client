const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

const DEVICE_CONNECTION_STRING = process.env.DEVICE_CONNECTION_STRING ||
  'HostName=dynadel.azure-devices.net;DeviceId=applepi;SharedAccessKey=ofFzm3umDCarpBXj6ccaqTF+QS8sIyKepQi/MTx2J9c=';

const INTERVAL = 2000;
const MAX_MESSAGE_COUNT = 20;
let sentMessageCount = 0;

const connectionString = ConnectionString.parse(DEVICE_CONNECTION_STRING);
const deviceId = connectionString.DeviceId;

const client = Client.fromConnectionString(DEVICE_CONNECTION_STRING, Protocol);


let stopReceivingMessage = false;

const completeMessageCallback = (err) => {
  if (err) {
    console.log(`[Device] Complete message error: ${err.toString()}`);
  }
  if (stopReceivingMessage) {
    client.close(closeConnectionCallback);
  }
}

const closeConnectionCallback = (err) => {
  if (err) {
    console.error('[Device] Close connection error: ' + err.message + '\n');
  } else {
    console.log('[Device] Connection closed\n');
  }
}

const receiveMessageCallback = (msg) => {
  const msgBodyString = msg.getData().toString('utf-8');
  const msgBody = JSON.parse(msgBodyString);
  console.log('[Device] Received message: ' + msgBodyString + '\n');
  switch (msgBody.command) {
    case 'stop':
      stopReceivingMessage = true;
      break;
    case 'blink':
    default:
      break;
  }
  client.complete(msg, completeMessageCallback);
}

client.open((err) => {
  if (err) {
    console.log(`[Device] Could not connect: ${err}\n`);
  } else {
    console.log('[Device] Client connected\n');
    client.on('message', receiveMessageCallback);
  }
});