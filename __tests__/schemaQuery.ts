import { schemaQuery } from '../src/schemaQuery';

describe('schemaQuery test', () => {
  const projectName = 'probable-cove-323115';
  const datasetName = 'turnstyl_test_events';
  const tableName = 'bank_transfer_events';

  describe('Check for empty args', () => {
    let errorWeExceptFor: any;
    const emptyStringError = 'Invalid Input: input is an empty string';

    it('When empty projectName it throws an empty string error', async () => {
      try {
        await schemaQuery('', datasetName, tableName);
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        expect(error).not.toBeNull();
      }
    });

    it('When empty datasetName it throws an empty string error', async () => {
      try {
        await schemaQuery(projectName, '', tableName);
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        expect(error).not.toBeNull();
      }
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });

    it('When empty tableName it throws an empty string error', async () => {
      try {
        await schemaQuery(projectName, datasetName, '');
      } catch (error) {
        expect(error).toEqual(emptyStringError);
        expect(error).not.toBeNull();
      }
      //if this assertion fails, the tests results/reports will only show
      //that some value is null, there won't be a word about a missing Exception
    });
  });
});
