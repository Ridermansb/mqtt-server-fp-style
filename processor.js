import R from 'ramda';
import helloWord from './request/helloWord';
import sumCalc from './request/sumCalc';

export default function processor(packet, client, publish) {
  const resolve = R.cond([
    helloWord,
    sumCalc
  ]);

  const publishIfConditionalResolved = R.pipe(
    resolve,
    R.when(R.identity, publish),
  );

  publishIfConditionalResolved(packet, client);
}