import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const ConfigSchema = Type.Object({
  redis: Type.Object({
    url: Type.String({ format: "uri" }),
  }),
  postgres: Type.Object({
    user: Type.String(),
    host: Type.String(),
    database: Type.String(),
    password: Type.String(),
    port: Type.Number(),
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
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
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
