import * as v from "valibot";
import type { LoggerConfig } from "./types";

export function getLoggerConfig(): LoggerConfig {
	return v.parse(
		v.object({
			application: v.string("アプリケーション名は必須です"),
			environment: v.optional(
				v.picklist(["development", "staging", "production"]),
				"development",
			),
			level: v.optional(
				v.picklist([
					"fatal",
					"error",
					"warn",
					"info",
					"debug",
					"trace",
					"silent",
				]),
				"info",
			),
			service: v.string("サービス名は必須です"),
		}),
		{
			application: process.env["APP_NAME"],
			environment: process.env["HOST_ENVIRONMENT"],
			level: process.env["LOG_LEVEL"],
			service: process.env["SERVICE_NAME"],
		},
	);
}
