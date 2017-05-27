/*
 Channel: hello/{text}
 Request:  { "command": "display_message" }
 Response: { "ok": true }
 */

import R from 'ramda';
import Ajv from 'ajv';
import { Buffer } from 'buffer';

// Topic regex validator
const matchChannel = /^calc\/(\d+)\,(\d+)/im;

// JSON Schema validator
const ajv = new Ajv();
const payloadRequestValidator = ajv.compile({
  type: 'object',
  properties: {
    command: {
      type: 'string',
      pattern: '^sum$',
    },
  },
  required: ['command'],
});

export function execute() {
  const matchNumbers = R.match(matchChannel);
  const topicProp = R.lensProp('topic');
  const viewTopic = R.view(topicProp);
  const transformToBuffer = obj => new Buffer.from(JSON.stringify(obj));
  const transformations = { n1: parseInt, n2: parseInt };
  const extractAndSum = R.pipe(
    viewTopic,
    matchNumbers,
    R.zipObj(['all', 'n1', 'n2']),
    R.pick(['n1', 'n2']),
    R.evolve(transformations),
    R.values,
    R.sum,
    transformToBuffer
  );

  const payloadProp = R.lensProp('payload');
  const setPayload = R.set(payloadProp);
  return R.chain(setPayload, extractAndSum);
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
