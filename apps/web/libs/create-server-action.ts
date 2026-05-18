import { fail, type Result } from "@harusame0616/result";
import { EventType } from "@repo/logger/event-types";
import type { Logger } from "@repo/logger/logger";
import { getLogger } from "@repo/logger/nextjs/server";
// eslint-disable-next-line camelcase
import { unstable_rethrow } from "next/navigation";
import type * as v from "valibot";
import * as valibot from "valibot";
import { getUserRole, type UserRole } from "@/features/auth/get-user-role";
import { getUserStaffId } from "@/features/auth/get-user-staff-id";

const VALIDATION_ERROR_MESSAGE = "入力内容に誤りがあります" as const;
const UNAUTHORIZED_ERROR_MESSAGE = "認証に失敗しました" as const;
const FORBIDDEN_ERROR_MESSAGE = "この操作を実行する権限がありません" as const;
const INTERNAL_SERVER_ERROR_MESSAGE =
  "サーバーエラーが発生しました。時間をおいて再度お試しください" as const;

interface PublicServerActionContext {
  logger: Logger;
  role: null;
  userId: null;
}

interface PrivateServerActionContext<TRole extends UserRole = UserRole> {
  logger: Logger;
  role: TRole;
  userId: string;
}

interface BaseOptions<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
> {
  name: string;
  schema?: TSchema;
  onSuccess?: (arguments_: {
    input: v.InferOutput<TSchema>;
    result: TData;
  }) => void | Promise<void>;
  onFailure?: (arguments_: {
    error: TError;
    input: v.InferOutput<TSchema>;
  }) => void | Promise<void>;
}

type PublicOptions<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
> = BaseOptions<TSchema, TData, TError> & {
  isPublic: true;
};

type PrivateOptions<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
  TRole extends UserRole = UserRole,
> = BaseOptions<TSchema, TData, TError> & {
  isPublic?: false;
  role?: TRole[];
};

type ServerActionErrorMessage =
  | typeof VALIDATION_ERROR_MESSAGE
  | typeof UNAUTHORIZED_ERROR_MESSAGE
  | typeof FORBIDDEN_ERROR_MESSAGE
  | typeof INTERNAL_SERVER_ERROR_MESSAGE;

// 1. Private + schema あり + role 指定あり
export function createServerAction<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
  TRole extends UserRole,
>(
  logicFunction: (
    input: v.InferOutput<TSchema>,
    context: PrivateServerActionContext<TRole>,
  ) => Promise<Result<TData, TError>>,
  options: PrivateOptions<TSchema, TData, TError, TRole> & {
    schema: TSchema;
    role: TRole[];
  },
): (
  input: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 2. Private + schema あり + role 指定なし
export function createServerAction<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
>(
  logicFunction: (
    input: v.InferOutput<TSchema>,
    context: PrivateServerActionContext,
  ) => Promise<Result<TData, TError>>,
  options: PrivateOptions<TSchema, TData, TError> & {
    schema: TSchema;
    role?: undefined;
  },
): (
  input: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 3. Public + schema あり
export function createServerAction<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
>(
  logicFunction: (
    input: v.InferOutput<TSchema>,
    context: PublicServerActionContext,
  ) => Promise<Result<TData, TError>>,
  options: PublicOptions<TSchema, TData, TError> & { schema: TSchema },
): (
  input: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 4. Private + schema なし + role 指定あり
export function createServerAction<
  TData,
  TError extends string,
  TRole extends UserRole,
>(
  logicFunction: (
    input: undefined,
    context: PrivateServerActionContext<TRole>,
  ) => Promise<Result<TData, TError>>,
  options: Omit<
    PrivateOptions<v.UndefinedSchema<undefined>, TData, TError, TRole>,
    "schema"
  > & {
    role: TRole[];
  },
): () => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 5. Private + schema なし + role 指定なし
export function createServerAction<TData, TError extends string>(
  logicFunction: (
    input: undefined,
    context: PrivateServerActionContext,
  ) => Promise<Result<TData, TError>>,
  options: Omit<
    PrivateOptions<v.UndefinedSchema<undefined>, TData, TError>,
    "schema"
  > & {
    role?: undefined;
  },
): () => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 6. Public + schema なし
export function createServerAction<TData, TError extends string>(
  logicFunction: (
    input: undefined,
    context: PublicServerActionContext,
  ) => Promise<Result<TData, TError>>,
  options: Omit<
    PublicOptions<v.UndefinedSchema<undefined>, TData, TError>,
    "schema"
  >,
): () => Promise<Result<TData, TError | ServerActionErrorMessage>>;

// 実装
export function createServerAction<
  TSchema extends v.GenericSchema,
  TData,
  TError extends string,
>(
  // オーバーロードの実装のため any を許容
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logicFunction: (input: any, context: any) => Promise<Result<TData, TError>>,
  options:
    | PublicOptions<TSchema, TData, TError>
    | PrivateOptions<TSchema, TData, TError, UserRole>,
): (
  input?: v.InferInput<TSchema>,
) => Promise<Result<TData, TError | ServerActionErrorMessage>> {
  return async (
    input?: v.InferInput<TSchema>,
  ): Promise<Result<TData, TError | ServerActionErrorMessage>> => {
    const logger = await getLogger(options.name);
    logger.info(`${options.name} を実行`, { input });

    let validatedInput: v.InferOutput<TSchema> =
      input as v.InferOutput<TSchema>;
    if (options.schema) {
      const parseResult = valibot.safeParse(options.schema, input);
      if (!parseResult.success) {
        logger.warn("バリデーション失敗", {
          event: EventType.InputValidationError,
          issues: parseResult.issues,
        });
        return fail(VALIDATION_ERROR_MESSAGE);
      }
      validatedInput = parseResult.output;
    }

    let context: PublicServerActionContext | PrivateServerActionContext;
    if (options.isPublic) {
      context = { logger, role: null, userId: null };
    } else {
      const userId = await getUserStaffId();
      if (!userId) {
        logger.warn("認証されていないアクセス", {
          event: EventType.AuthenticationFailure,
        });
        return fail(UNAUTHORIZED_ERROR_MESSAGE);
      }

      const role = await getUserRole();
      if (
        "role" in options &&
        options.role &&
        options.role.length > 0 &&
        !options.role.includes(role)
      ) {
        logger.warn("権限がないアクセス", {
          event: EventType.AuthorizationError,
        });
        return fail(FORBIDDEN_ERROR_MESSAGE);
      }
      context = { logger, role, userId };
    }

    try {
      const result = await logicFunction(validatedInput, context);

      if (result.success) {
        logger.info(`${options.name} 成功`);
        await options.onSuccess?.({
          input: validatedInput,
          result: result.data,
        });
      } else {
        logger.warn(`${options.name} 失敗`, { error: result.error });
        await options.onFailure?.({
          error: result.error,
          input: validatedInput,
        });
      }

      return result;
    } catch (error) {
      unstable_rethrow(error);
      logger.error(`${options.name} で予期しないエラーが発生`, { err: error });
      return fail(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  };
}
