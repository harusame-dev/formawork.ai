import { schemaName } from "./pgschema";

export const ADVICE_QUEUE_NAME = `${schemaName}_service_advice`.slice(0, 48);
