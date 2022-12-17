global.Cypress = {
  env: jest.fn(),
  log: () => null,
  config: () => "/cypress/screenshots",
  Commands: {
    add: jest.fn(),
  },
};


global.cy = {
  get: jest.fn(),
  screenshot: jest.fn()
}
const command = require("../src/command");

describe("compareSnapshot command", () => {
  it("should be added", () => {
    Cypress.Commands.add.mockReset();

    command.compareSnapshotCommand();

    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      "compareSnapshot",
      { prevSubject: "optional" },
      expect.any(Function)
    );
  });

  it("should get cypress env variables", () => {
    command.compareSnapshot()(undefined, "test-name")

    expect(Cypress.env).toHaveBeenCalledWith('SNAPSHOT_BASE_DIRECTORY')
    expect(Cypress.env).toHaveBeenCalledWith('SNAPSHOT_DIFF_DIRECTORY')
    expect(Cypress.env).toHaveBeenCalledWith('ALWAYS_GENERATE_DIFF')
  })
});
