/*
 Channel: hello/{text}
 Request:  { "command": "display_message" }
 Response: { "ok": true }
 */

import R from 'ramda';
import Ajv from 'ajv';
import { Buffer } from 'buffer';

// Topic regex validator
const matchChannel = /^hello\/(\w.+)/im;

// JSON Schema validator
const ajv = new Ajv();
const payloadRequestValidator = ajv.compile({
  type: 'object',
  properties: {
    command: {
      type: 'string',
      pattern: '^display_message$',
    },
  },
  required: ['command'],
});

export function execute() {
  // Extract message
  const matchMessage = R.match(matchChannel);
  const topicProp = R.lensProp('topic');
  const viewTopic = R.view(topicProp);
  const extractMessage = R.pipe(matchMessage, R.nth(1));

  // Set Payload
  const transformToBuffer = obj => new Buffer.from(JSON.stringify(obj));
  const getMessage = R.pipe(viewTopic, extractMessage, transformToBuffer);
  const payloadProp = R.lensProp('payload');
  const setPayload = R.set(payloadProp);
  return R.chain(setPayload, getMessage);
}

export function match() {
  // Validate topic against regex
  const topicLens = R.lensProp('topic');
  const isTopicValid = R.pipe(R.view(topicLens), R.test(matchChannel));

  // Get JSON
  const payloadLeans = R.lensProp('payload');
  const payloadView = R.view(payloadLeans);
  const utf8String = prop => prop.toString('utf-8');
  const getPayload = R.pipe(R.over(payloadLeans, utf8String), payloadView, JSON.parse);

  // Check JSON schema
  const isPayloadValid = R.pipe(R.tryCatch(getPayload, R.F), payloadRequestValidator);

  // If is a valid schema and valid topic, return true
  return R.both(isPayloadValid, isTopicValid);
}

export default [R.call(match), R.call(execute)];


