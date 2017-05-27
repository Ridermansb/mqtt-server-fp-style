import mosca from 'mosca';
import processor from './processor';

require('dotenv').config();

const PORT = parseInt(process.env.MQTT_PORT, 10) || 1886;
const MQTT_HTTP_PORT = parseInt(process.env.MQTT_HTTP_PORT, 10) || 9001;

const moscaSettings = {
  port: PORT,
  backend: { type: 'memory' },
  persistence: { factory: mosca.persistence.Memory },
  http: {
    port: MQTT_HTTP_PORT,
    bundle: true,
    static: './',
  },
};

const server = new mosca.Server(moscaSettings);

server.on('ready', function setup() {
    console.log('MQTT Server is ready on port ', moscaSettings.port);
  }
);

// fired when a message is received
server.on('published', (packet, client, cb) => {
  console.log('Published : ', packet.payload);
  const onPublish = (packetResp) => {
    server.publish(packetResp, client, cb);
  };
  processor(packet, client, onPublish);
});