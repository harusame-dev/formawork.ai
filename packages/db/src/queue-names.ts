import { schemaName } from "./pgschema";

export const ADVICE_QUEUE_NAME = `${schemaName}_service_advice`.slice(0, 47);
export const MEMORY_QUEUE_NAME = `${schemaName}_customer_memory`.slice(0, 47);
