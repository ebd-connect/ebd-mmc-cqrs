import express from 'express';
import {
  AxonApplication,
  ClientIdentification,
  configLogger,
  credentials,
  logger,
  messageBus,
} from '@ebd-connect/cqrs-framework';
import { v4 as uuid } from 'uuid';

const isProduction = false;
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3100;
const AXON_HOST = process.env.AXON_HOST ?? 'localhost:8124';
//axon connector
configLogger();
// isProduction && {
//   service: {
//     name: pkg.name,
//     type: 'expressjs',
//     version: pkg.version,
//     build: '1', //buildMeta.build,
//   },
//}
const axonConnector = new AxonApplication({
  connection: {
    serviceClientInit: {
      address: AXON_HOST,
      credentials: credentials.createInsecure(),
    },
    clientIdentification: new ClientIdentification()
      .setComponentName('ebd-gateway')
      .setClientId(isProduction ? uuid() : 'local'),
    forceStayOnSameConnection: !isProduction,
  },
});
axonConnector.connect();
const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  const command: string = req.body['command'] as string;
  const payload: never = req.body['payload'] as never;

  if (command && payload) {
    try {
      const result = await messageBus.execute(
        Object.assign(payload, { constructor: { name: command } })
      );
      res.send(result);
    } catch (e) {
      logger.error(`${e.name}: ${e.message}`);
      res.status(500).send(e.name);
    }
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
