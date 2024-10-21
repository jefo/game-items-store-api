import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const ConfigSchema = Type.Object({
  redis: Type.Object({
    url: Type.String({ format: "uri" }),
  }),
  postgres: Type.Object({
    connection: Type.String(),
  }),
});

type Config = typeof ConfigSchema.static;

const configCompiler = TypeCompiler.Compile(ConfigSchema);

export function loadConfig(): Config {
  const config = {
    redis: {
      url: process.env.REDIS_URL,
    },
    postgres: {
      connection: process.env.DB_CONNECTION,
    },
  };

  if (!configCompiler.Check(config)) {
    const errors = [...configCompiler.Errors(config)];
    throw new Error(
      `Invalid configuration: ${JSON.stringify(errors, null, 2)}`
    );
  }

  return config;
}

export const cfg = loadConfig();
