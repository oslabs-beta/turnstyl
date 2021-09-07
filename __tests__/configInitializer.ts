const { configInitializer } = require('../src/configInitializer.ts');

describe('configInitializer test', () => {
  describe('Check for correct returned data type', () => {
    it('When invoked it returns an object', async () => {
      const result = await configInitializer();
      expect(typeof result === 'object').toBe(true);
    });
  });

  describe('Check for correct error', () => {
    let errorWeExceptFor: any;
    const errorString: string =
      '😭 No config file found. Please initialise a yaml config file at the root of your directory. See https://github.com/oslabs-beta/turnstyl for more instructions on how to do this';

    it("When YAML can't be found throw error", async () => {
      try {
        const result = await configInitializer();
      } catch (error) {
        expect(error).toEqual(errorString);
        errorWeExceptFor = error;
      }
      expect(errorWeExceptFor).not.toBeNull();
    });
  });
});
