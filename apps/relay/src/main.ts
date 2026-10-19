import { loadConfig } from "./config.ts";
import { GatewayPool } from "./gateways.ts";
import { buildServer } from "./server.ts";

const config = loadConfig();
const pool = new GatewayPool(config);
const app = buildServer(config, pool);

const shutdown = async () => {
  await app.close();
  pool.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: config.port, host: config.host });
app.log.info(`Weft relay forwarding to ${config.peerEndpoint}`);
