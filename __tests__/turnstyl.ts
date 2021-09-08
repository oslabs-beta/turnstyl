import { Turnstyl } from '../src/turnstyl';
const { schemaQuery } = require('../src/schemaQuery');

describe('Turnstyl test', () => {
  const turnstylTestClass = new Turnstyl();

  const testTopic: string = 'bank_transfer_events';

  const testMessage: object = {
    event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
    eventTimstamp: '2062-08-08T03:53:23.563Z',
    eventName: 'bank_transfer_transactions',
    senderName: 'Dana Rohan',
    senderAccount: '77838202',
    senderAccountName: 'Home Loan Account',
    receiverName: 'Ms. Craig Smith',
    receiverAccount: '93915846',
    receiverAccountName: 'Money Market Account',
    transactionDesc:
      'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
    transaction_type: 'invoice',
    amount: '480.22',
    currency: 'Serbian Dinar',
    curencyCode: 'NPR',
  };
  const testNest: object = {
    event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
    eventTimstamp: '2062-08-08T03:53:23.563Z',
    eventName: 'bank_transfer_transactions',
    senderName: 'Dana Rohan',
    senderAccount: '77838202',
    senderAccountName: 'Home Loan Account',
    receiverName: 'Ms. Craig Smith',
    receiverAccount: '93915846',
    receiverAccountName: 'Money Market Account',
    transactionDesc:
      'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
    NEST1: {
      SUB: 'here is extra nest',
      SUB2: 'nest 2',
    },
    transaction_type: 'invoice',
    amount: '480.22',
    currency: 'Serbian Dinar',
    curencyCode: 'NPR',
    NEST: {
      MATCH: 'false',
      EXTRA: 'this should fail now',
    },
  };
  const testNest2: object = {
    event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
    eventTimstamp: '2062-08-08T03:53:23.563Z',
    eventName: 'bank_transfer_transactions',
    senderName: 'Dana Rohan',
    senderAccount: '77838202',
    senderAccountName: 'Home Loan Account',
    receiverName: 'Ms. Craig Smith',
    receiverAccount: '93915846',
    receiverAccountName: 'Money Market Account',
    transactionDesc:
      'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
    NEST1: {
      SUB: 'DIFFERENT VALUE',
      SUB2: 'DIFFERENT VALUE',
    },
    transaction_type: 'invoice',
    amount: '480.22',
    currency: 'Serbian Dinar',
    curencyCode: 'NPR',
    NEST: {
      MATCH: 'false',
      EXTRA: 'this should fail now',
    },
  };
  const testNestBad: object = {
    event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
    eventTimstamp: '2062-08-08T03:53:23.563Z',
    eventName: 'bank_transfer_transactions',
    senderName: 'Dana Rohan',
    senderAccount: '77838202',
    senderAccountName: 'Home Loan Account',
    receiverName: 'Ms. Craig Smith',
    receiverAccount: '93915846',
    receiverAccountName: 'Money Market Account',
    transactionDesc:
      'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
    NEST1: {
      SUB: 'here is extra nest',
      SUB2: 'nest 2',
      ERROR: ' this is the extra level',
    },
    transaction_type: 'invoice',
    amount: '480.22',
    currency: 'Serbian Dinar',
    curencyCode: 'NPR',
    NEST: {
      MATCH: 'false',
      EXTRA: 'this should fail now',
    },
  };
  const testNestEmpty: object = {
    event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
    eventTimstamp: '2062-08-08T03:53:23.563Z',
    eventName: 'bank_transfer_transactions',
    senderName: 'Dana Rohan',
    senderAccount: '77838202',
    senderAccountName: 'Home Loan Account',
    receiverName: 'Ms. Craig Smith',
    receiverAccount: '93915846',
    receiverAccountName: 'Money Market Account',
    transactionDesc:
      'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
    NEST1: 'just text no obj',
    transaction_type: 'invoice',
    amount: '480.22',
    currency: 'Serbian Dinar',
    curencyCode: 'NPR',
    NEST: 'just text no obj',
  };

  describe('Class datatype checking', () => {
    it('When initialised turnstyl is an object', () => {
      expect(typeof turnstylTestClass === 'object').toBe(true);
    });
    it('When initialised turnstyl is an object', () => {
      expect(typeof turnstylTestClass === 'object').toBe(true);
    });
    it("When initialised turnstyl['cacheProducerEvent'] is a function", () => {
      expect(
        typeof turnstylTestClass['cacheProducerEvent'] === 'function'
      ).toBe(true);
    });

    it("When initialised turnstyl['extractSchema'] is a function", () => {
      expect(typeof turnstylTestClass['extractSchema'] === 'function').toBe(
        true
      );
    });

    it("When initialised turnstyl['jsonDatatypeParser'] is a function", () => {
      expect(
        typeof turnstylTestClass['jsonDatatypeParser'] === 'function'
      ).toBe(true);
    });

    it("When initialised turnstyl['compareProducerToDBSchema'] is a function", () => {
      expect(
        typeof turnstylTestClass['compareProducerToDBSchema'] === 'function'
      ).toBe(true);
    });
  });

  describe('Function testing', () => {
    let errorWeExceptFor: any;
    it('Turnstyl.cacheProducerEvent when invoked dumps data into the cache object', async () => {
      await turnstylTestClass.cacheProducerEvent(testTopic, testMessage);
      const result = await turnstylTestClass.schemaCache[testTopic];
      expect(typeof result === 'object').toBe(true);
    });

    it('Turnstyl.jsonDatatypeParser when invoked parses object into an object schema', async () => {
      const result = await turnstylTestClass.jsonDatatypeParser(testMessage);
      // Tests that an object is being returned
      expect(typeof result === 'object').toBe(true);
      // Tests that we're receiving datatypes in our object
      expect(result['senderName'] === 'string').toBe(true);
    });

    it('Turnstyl.extractSchema when invoked dumps an empty object into the cache', async () => {
      await delete turnstylTestClass.schemaCache[testTopic];
      // Checks that value is deleted from cache
      expect(turnstylTestClass.schemaCache[testTopic] === undefined).toBe(true);
      await turnstylTestClass.cacheProducerEvent(testTopic, testMessage);
      const result = await turnstylTestClass.schemaCache;
      // Checks that new object is placed in cache
      expect(typeof result === 'object').toBe(true);
    });

    it('Turnstyl.compareProducerToDBSchema when invoked compares the db payload to the event', async () => {
      await turnstylTestClass.cacheProducerEvent(testTopic, testMessage);
      console.log('✅ Invokes cacheProducerEvent');
      try {
        const result = await turnstylTestClass.compareProducerToDBSchema(
          testTopic
        );
      } catch (error) {
        expect(error).toEqual(
          'Mismatch detected:❌ The database payload and producer event do not match'
        );
      }
    });

    it('Turnstyl.deepCompareKeys correctly handles matching nested schema with differnet values', () => {
      const result = turnstylTestClass.deepCompareKeys(testNest, testNest2);
      expect(result).toBe(true);
    });

    it('Turnstyl.deepCompareKeys correctly handles nested schema with different keys as mismatching', () => {
      const result = turnstylTestClass.deepCompareKeys(testNest, testNestBad);
      expect(result).toBe(false);
    });

    it('Turnstyl.deepCompareKeys correctly detects nesting mistmach despite same keys as mismatching', () => {
      const result = turnstylTestClass.deepCompareKeys(testNest, testNestEmpty);
      expect(result).toBe(false);
    });

    it('Turnstyl.deepCompareKeys correctly detects general mismatch with extra keys', () => {
      const result = turnstylTestClass.deepCompareKeys(testMessage, testNest);
      expect(result).toBe(false);
    });

    it('Turrnstyl.deepCompareKeys correctly detects an example from the database', () => {
      const dbPayload = {
        event_id: '321574dc-2b12-4d86-933a-1f173d1fb51d',
        eventTimestamp: '2024-06-28T15:42:48.870Z',
        eventName: 'bank_transfer_transactions',
        senderName: 'Kay Mante',
        senderAccount: '19035200',
        senderAccountName: 'Credit Card Account',
        receiverName: 'Dr. Jill Ullrich',
        receiverAccountName: 'Checking Account',
        transactionDesc:
          "deposit transaction at Jacobson, O'Reilly and Towne using card ending with ***8953 for THB 678.23 in account ***38313348",
        amount: '918.94',
        curencyCode: 'EGP',
      };
      const producerSchema = {
        event_id: 'string',
        eventTimestamp: {},
        eventName: 'string',
        senderName: 'string',
        senderAccount: 'number',
        senderAccountName: 'string',
        receiverName: 'string',
        receiverAccount: 'number',
        receiverAccountName: 'string',
        transactionDesc: 'string',
        transaction_type: 'string',
        amount: 'number',
        currency: 'string',
        curencyCode: 'string',
      };
      expect(turnstylTestClass.deepCompareKeys(producerSchema, dbPayload)).toBe(
        false
      );
    });
  });
});
