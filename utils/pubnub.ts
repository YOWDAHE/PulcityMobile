import PubNub from "pubnub";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const pubnub = new PubNub({
  publishKey: 'pub-c-fe44933e-15ab-4f95-b926-a9a6897017db',
  subscribeKey:"sub-c-0c1573c9-e0fb-400d-a8c7-7a032ec2bb90",
  secretKey: "sec-c-NmNmNmYxM2EtMTcxYi00ZTMwLTlkYmItOWJhNWU2NjM1ZDc5",
  uuid: uuidv4(),
});

export default pubnub;
