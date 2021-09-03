import { Turnstyl } from '../src/turnstyl';

describe('Turnstyl test', () => {
  const turnstylTestClass = new Turnstyl();
  const testTopic: string = 'testTopic';
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
      await turnstylTestClass.extractSchema(testTopic);
      const result = await turnstylTestClass.schemaCache;
      // Checks that new object is placed in cache
      expect(typeof result === 'object').toBe(true);
    });

    it('Turnstyl.compareProducerToDBSchema when invoked compares the db payload to the event', async () => {
      try {
        const result = await turnstylTestClass.compareProducerToDBSchema(
          testTopic
        );
      } catch (error) {
        expect(error).toEqual(
          'Mismatch detected:  The database payload and producer event do not match'
        );
      }
    });
  });
});
