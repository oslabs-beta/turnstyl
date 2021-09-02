const { schemaQuery } = require('../src/schemaQuery.ts');

describe('schemaQuery test', () => {
  const projectName: String = 'probable-cove-323115';
  const datasetName: String = 'turnstyl_test_events';
  const tableName: string = 'bank_transfer_events';

  describe('Check for correct returned output', () => {
    it('When invoked schemaQuery returns an object', async () => {
      const result = await schemaQuery(projectName, datasetName, tableName);
      expect(typeof result === 'object').toBe(true);
    });
  });
  describe('Check for null args', () => {
    let errorWeExceptFor: any;
    const nullInputError: string = 'Invalid Input: input is undefined';
    it('When null projectName input it throws a missing val error', async () => {
      try {
        const result = await schemaQuery(null, datasetName, tableName);
      } catch (error) {
        expect(error).toEqual(nullInputError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });

    it('When null datasetName input it throws a missing val error', async () => {
      try {
        const result = await schemaQuery(projectName, null, tableName);
      } catch (error) {
        expect(error).toEqual(nullInputError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });

    it('When null tableName input it throws a missing val error', async () => {
      try {
        const result = await schemaQuery(projectName, datasetName, null);
      } catch (error) {
        expect(error).toEqual(nullInputError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });
  });

  describe('Check for empty args', () => {
    let errorWeExceptFor: any;
    const emptyStringError: string = 'Invalid Input: input is an empty string';

    it('When empty projectName it throws an empty string error', async () => {
      try {
        const result = await schemaQuery('', datasetName, tableName);
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });

    it('When empty datasetName it throws an empty string error', async () => {
      try {
        const result = await schemaQuery(projectName, '', tableName);
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });

    it('When empty tableName it throws an empty string error', async () => {
      try {
        const result = await schemaQuery(projectName, datasetName, '');
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });
  });
});
