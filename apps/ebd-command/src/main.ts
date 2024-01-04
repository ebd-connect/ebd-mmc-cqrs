import { invoiceSentCommandHandlers } from '@backend/invoice-sent';

import { v4 as uuid } from 'uuid';
import {
  AxonApplication,
  ClientIdentification,
  configLogger,
  credentials,
} from '@ebd-connect/cqrs-framework';

const isProduction = false;
const AXON_HOST = process.env.AXON_HOST ?? 'localhost:8124';
//axon connector
configLogger();
const axonConnector = new AxonApplication({
  commandHandlers: [
    ...invoiceSentCommandHandlers,

    ...invoiceSentCommandHandlers,

    //
  ],
  connection: {
    serviceClientInit: {
      address: AXON_HOST,
      credentials: credentials.createInsecure(),
    },
    clientIdentification: new ClientIdentification()
      .setComponentName('ebd-command')
      .setClientId(isProduction ? uuid() : 'local'),
    forceStayOnSameConnection: !isProduction,
  },
});
axonConnector.connect();
