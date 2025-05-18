import { CLI } from "./cli";

describe("CLI", () => {
  test("handles basic command", () => {
    const cli = new CLI();
    const mockFn = jest.fn();

    cli.register("hello", mockFn);
    cli.run("hello");

    expect(mockFn).toHaveBeenCalledWith({ _: [] });
  });

  test("parses long and short args", () => {
    const cli = new CLI();
    const mockFn = jest.fn();

    cli.register("greet", mockFn);
    cli.run("greet --name John -v");

    expect(mockFn).toHaveBeenCalledWith({ name: "John", v: true, _: [] });
  });

  test("handles subcommands", () => {
    const cli = new CLI();
    const mockFn = jest.fn();

    cli.register(["user", "add"], mockFn);
    cli.run("user add -name Alice");

    expect(mockFn).toHaveBeenCalledWith({ name: "Alice", _: [] });
  });

  test("returns error for unknown command", () => {
    const cli = new CLI();
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const log = cli.run("unknown");

    expect(errorSpy).toHaveBeenCalledWith("Unknown command: unknown");
    expect(log).toBe("Unknown command: unknown");
    errorSpy.mockRestore();
  });

  test("should correctly parse positional argument", () => {
    const cli = new CLI();
    const mockFn = jest.fn();
    cli.register("ls", mockFn);

    cli.run("ls /mydir");
    expect(mockFn).toHaveBeenCalledWith({ _: ["/mydir"] });
  });

  test("should correctly parse multiple positional argument", () => {
    const cli = new CLI();
    const mockFn = jest.fn();
    cli.register("cp", mockFn);

    cli.run("cp alice.txt bob.txt");
    expect(mockFn).toHaveBeenCalledWith({ _: ["alice.txt", 'bob.txt'] });
  });
});
