/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Recipe
 *
 */
export type Recipe = $Result.DefaultSelection<Prisma.$RecipePayload>;
/**
 * Model Ingredient
 *
 */
export type Ingredient = $Result.DefaultSelection<Prisma.$IngredientPayload>;
/**
 * Model Unit
 *
 */
export type Unit = $Result.DefaultSelection<Prisma.$UnitPayload>;
/**
 * Model RecipeIngredient
 *
 */
export type RecipeIngredient =
    $Result.DefaultSelection<Prisma.$RecipeIngredientPayload>;
/**
 * Model Rating
 *
 */
export type Rating = $Result.DefaultSelection<Prisma.$RatingPayload>;
/**
 * Model Instruction
 *
 */
export type Instruction = $Result.DefaultSelection<Prisma.$InstructionPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
    ClientOptions extends
        Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
    U = 'log' extends keyof ClientOptions
        ? ClientOptions['log'] extends Array<
              Prisma.LogLevel | Prisma.LogDefinition
          >
            ? Prisma.GetEvents<ClientOptions['log']>
            : never
        : never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

    /**
     * ##  Prisma Client ʲˢ
     *
     * Type-safe database client for TypeScript & Node.js
     * @example
     * ```
     * const prisma = new PrismaClient()
     * // Fetch zero or more Users
     * const users = await prisma.user.findMany()
     * ```
     *
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
     */

    constructor(
        optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>
    );
    $on<V extends U>(
        eventType: V,
        callback: (
            event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent
        ) => void
    ): PrismaClient;

    /**
     * Connect with the database
     */
    $connect(): $Utils.JsPromise<void>;

    /**
     * Disconnect from the database
     */
    $disconnect(): $Utils.JsPromise<void>;

    /**
     * Add a middleware
     * @deprecated since 4.16.0. For new code, prefer client extensions instead.
     * @see https://pris.ly/d/extensions
     */
    $use(cb: Prisma.Middleware): void;

    /**
     * Executes a prepared raw query and returns the number of affected rows.
     * @example
     * ```
     * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $executeRaw<T = unknown>(
        query: TemplateStringsArray | Prisma.Sql,
        ...values: any[]
    ): Prisma.PrismaPromise<number>;

    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $executeRawUnsafe<T = unknown>(
        query: string,
        ...values: any[]
    ): Prisma.PrismaPromise<number>;

    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRaw<T = unknown>(
        query: TemplateStringsArray | Prisma.Sql,
        ...values: any[]
    ): Prisma.PrismaPromise<T>;

    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRawUnsafe<T = unknown>(
        query: string,
        ...values: any[]
    ): Prisma.PrismaPromise<T>;

    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(
        arg: [...P],
        options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
    ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

    $transaction<R>(
        fn: (
            prisma: Omit<PrismaClient, runtime.ITXClientDenyList>
        ) => $Utils.JsPromise<R>,
        options?: {
            maxWait?: number;
            timeout?: number;
            isolationLevel?: Prisma.TransactionIsolationLevel;
        }
    ): $Utils.JsPromise<R>;

    $extends: $Extensions.ExtendsHook<
        'extends',
        Prisma.TypeMapCb<ClientOptions>,
        ExtArgs,
        $Utils.Call<
            Prisma.TypeMapCb<ClientOptions>,
            {
                extArgs: ExtArgs;
            }
        >
    >;

    /**
     * `prisma.user`: Exposes CRUD operations for the **User** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Users
     * const users = await prisma.user.findMany()
     * ```
     */
    get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

    /**
     * `prisma.recipe`: Exposes CRUD operations for the **Recipe** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Recipes
     * const recipes = await prisma.recipe.findMany()
     * ```
     */
    get recipe(): Prisma.RecipeDelegate<ExtArgs, ClientOptions>;

    /**
     * `prisma.ingredient`: Exposes CRUD operations for the **Ingredient** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Ingredients
     * const ingredients = await prisma.ingredient.findMany()
     * ```
     */
    get ingredient(): Prisma.IngredientDelegate<ExtArgs, ClientOptions>;

    /**
     * `prisma.unit`: Exposes CRUD operations for the **Unit** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Units
     * const units = await prisma.unit.findMany()
     * ```
     */
    get unit(): Prisma.UnitDelegate<ExtArgs, ClientOptions>;

    /**
     * `prisma.recipeIngredient`: Exposes CRUD operations for the **RecipeIngredient** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more RecipeIngredients
     * const recipeIngredients = await prisma.recipeIngredient.findMany()
     * ```
     */
    get recipeIngredient(): Prisma.RecipeIngredientDelegate<
        ExtArgs,
        ClientOptions
    >;

    /**
     * `prisma.rating`: Exposes CRUD operations for the **Rating** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Ratings
     * const ratings = await prisma.rating.findMany()
     * ```
     */
    get rating(): Prisma.RatingDelegate<ExtArgs, ClientOptions>;

    /**
     * `prisma.instruction`: Exposes CRUD operations for the **Instruction** model.
     * Example usage:
     * ```ts
     * // Fetch zero or more Instructions
     * const instructions = await prisma.instruction.findMany()
     * ```
     */
    get instruction(): Prisma.InstructionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
    export import DMMF = runtime.DMMF;

    export type PrismaPromise<T> = $Public.PrismaPromise<T>;

    /**
     * Validator
     */
    export import validator = runtime.Public.validator;

    /**
     * Prisma Errors
     */
    export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
    export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
    export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
    export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
    export import PrismaClientValidationError = runtime.PrismaClientValidationError;

    /**
     * Re-export of sql-template-tag
     */
    export import sql = runtime.sqltag;
    export import empty = runtime.empty;
    export import join = runtime.join;
    export import raw = runtime.raw;
    export import Sql = runtime.Sql;

    /**
     * Decimal.js
     */
    export import Decimal = runtime.Decimal;

    export type DecimalJsLike = runtime.DecimalJsLike;

    /**
     * Metrics
     */
    export type Metrics = runtime.Metrics;
    export type Metric<T> = runtime.Metric<T>;
    export type MetricHistogram = runtime.MetricHistogram;
    export type MetricHistogramBucket = runtime.MetricHistogramBucket;

    /**
     * Extensions
     */
    export import Extension = $Extensions.UserArgs;
    export import getExtensionContext = runtime.Extensions.getExtensionContext;
    export import Args = $Public.Args;
    export import Payload = $Public.Payload;
    export import Result = $Public.Result;
    export import Exact = $Public.Exact;

    /**
     * Prisma Client JS version: 6.5.0
     * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
     */
    export type PrismaVersion = {
        client: string;
    };

    export const prismaVersion: PrismaVersion;

    /**
     * Utility Types
     */

    export import JsonObject = runtime.JsonObject;
    export import JsonArray = runtime.JsonArray;
    export import JsonValue = runtime.JsonValue;
    export import InputJsonObject = runtime.InputJsonObject;
    export import InputJsonArray = runtime.InputJsonArray;
    export import InputJsonValue = runtime.InputJsonValue;

    /**
     * Types of the values used to represent different kinds of `null` values when working with JSON fields.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    namespace NullTypes {
        /**
         * Type of `Prisma.DbNull`.
         *
         * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
         *
         * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
         */
        class DbNull {
            private DbNull: never;
            private constructor();
        }

        /**
         * Type of `Prisma.JsonNull`.
         *
         * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
         *
         * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
         */
        class JsonNull {
            private JsonNull: never;
            private constructor();
        }

        /**
         * Type of `Prisma.AnyNull`.
         *
         * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
         *
         * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
         */
        class AnyNull {
            private AnyNull: never;
            private constructor();
        }
    }

    /**
     * Helper for filtering JSON entries that have `null` on the database (empty on the db)
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    export const DbNull: NullTypes.DbNull;

    /**
     * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    export const JsonNull: NullTypes.JsonNull;

    /**
     * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    export const AnyNull: NullTypes.AnyNull;

    type SelectAndInclude = {
        select: any;
        include: any;
    };

    type SelectAndOmit = {
        select: any;
        omit: any;
    };

    /**
     * Get the type of the value, that the Promise holds.
     */
    export type PromiseType<T extends PromiseLike<any>> =
        T extends PromiseLike<infer U> ? U : T;

    /**
     * Get the return type of a function which returns a Promise.
     */
    export type PromiseReturnType<
        T extends (...args: any) => $Utils.JsPromise<any>
    > = PromiseType<ReturnType<T>>;

    /**
     * From T, pick a set of properties whose keys are in the union K
     */
    type Prisma__Pick<T, K extends keyof T> = {
        [P in K]: T[P];
    };

    export type Enumerable<T> = T | Array<T>;

    export type RequiredKeys<T> = {
        [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
    }[keyof T];

    export type TruthyKeys<T> = keyof {
        [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
    };

    export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

    /**
     * Subset
     * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
     */
    export type Subset<T, U> = {
        [key in keyof T]: key extends keyof U ? T[key] : never;
    };

    /**
     * SelectSubset
     * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
     * Additionally, it validates, if both select and include are present. If the case, it errors.
     */
    export type SelectSubset<T, U> = {
        [key in keyof T]: key extends keyof U ? T[key] : never;
    } & (T extends SelectAndInclude
        ? 'Please either choose `select` or `include`.'
        : T extends SelectAndOmit
          ? 'Please either choose `select` or `omit`.'
          : {});

    /**
     * Subset + Intersection
     * @desc From `T` pick properties that exist in `U` and intersect `K`
     */
    export type SubsetIntersection<T, U, K> = {
        [key in keyof T]: key extends keyof U ? T[key] : never;
    } & K;

    type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

    /**
     * XOR is needed to have a real mutually exclusive union type
     * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
     */
    type XOR<T, U> = T extends object
        ? U extends object
            ? (Without<T, U> & U) | (Without<U, T> & T)
            : U
        : T;

    /**
     * Is T a Record?
     */
    type IsObject<T extends any> =
        T extends Array<any>
            ? False
            : T extends Date
              ? False
              : T extends Uint8Array
                ? False
                : T extends BigInt
                  ? False
                  : T extends object
                    ? True
                    : False;

    /**
     * If it's T[], return T
     */
    export type UnEnumerate<T extends unknown> =
        T extends Array<infer U> ? U : T;

    /**
     * From ts-toolbelt
     */

    type __Either<O extends object, K extends Key> = Omit<O, K> &
        {
            // Merge all but K
            [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
        }[K];

    type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

    type EitherLoose<O extends object, K extends Key> = ComputeRaw<
        __Either<O, K>
    >;

    type _Either<O extends object, K extends Key, strict extends Boolean> = {
        1: EitherStrict<O, K>;
        0: EitherLoose<O, K>;
    }[strict];

    type Either<
        O extends object,
        K extends Key,
        strict extends Boolean = 1
    > = O extends unknown ? _Either<O, K, strict> : never;

    export type Union = any;

    type PatchUndefined<O extends object, O1 extends object> = {
        [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
    } & {};

    /** Helper Types for "Merge" **/
    export type IntersectOf<U extends Union> = (
        U extends unknown ? (k: U) => void : never
    ) extends (k: infer I) => void
        ? I
        : never;

    export type Overwrite<O extends object, O1 extends object> = {
        [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
    } & {};

    type _Merge<U extends object> = IntersectOf<
        Overwrite<
            U,
            {
                [K in keyof U]-?: At<U, K>;
            }
        >
    >;

    type Key = string | number | symbol;
    type AtBasic<O extends object, K extends Key> = K extends keyof O
        ? O[K]
        : never;
    type AtStrict<O extends object, K extends Key> = O[K & keyof O];
    type AtLoose<O extends object, K extends Key> = O extends unknown
        ? AtStrict<O, K>
        : never;
    export type At<
        O extends object,
        K extends Key,
        strict extends Boolean = 1
    > = {
        1: AtStrict<O, K>;
        0: AtLoose<O, K>;
    }[strict];

    export type ComputeRaw<A extends any> = A extends Function
        ? A
        : {
              [K in keyof A]: A[K];
          } & {};

    export type OptionalFlat<O> = {
        [K in keyof O]?: O[K];
    } & {};

    type _Record<K extends keyof any, T> = {
        [P in K]: T;
    };

    // cause typescript not to expand types and preserve names
    type NoExpand<T> = T extends unknown ? T : never;

    // this type assumes the passed object is entirely optional
    type AtLeast<O extends object, K extends string> = NoExpand<
        O extends unknown
            ?
                  | (K extends keyof O ? { [P in K]: O[P] } & O : O)
                  | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
            : never
    >;

    type _Strict<U, _U = U> = U extends unknown
        ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
        : never;

    export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
    /** End Helper Types for "Merge" **/

    export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

    /**
  A [[Boolean]]
  */
    export type Boolean = True | False;

    // /**
    // 1
    // */
    export type True = 1;

    /**
  0
  */
    export type False = 0;

    export type Not<B extends Boolean> = {
        0: 1;
        1: 0;
    }[B];

    export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
        ? 0 // anything `never` is false
        : A1 extends A2
          ? 1
          : 0;

    export type Has<U extends Union, U1 extends Union> = Not<
        Extends<Exclude<U1, U>, U1>
    >;

    export type Or<B1 extends Boolean, B2 extends Boolean> = {
        0: {
            0: 0;
            1: 1;
        };
        1: {
            0: 1;
            1: 1;
        };
    }[B1][B2];

    export type Keys<U extends Union> = U extends unknown ? keyof U : never;

    type Cast<A, B> = A extends B ? A : B;

    export const type: unique symbol;

    /**
     * Used by group by
     */

    export type GetScalarType<T, O> = O extends object
        ? {
              [P in keyof T]: P extends keyof O ? O[P] : never;
          }
        : never;

    type FieldPaths<
        T,
        U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
    > = IsObject<T> extends True ? U : T;

    type GetHavingFields<T> = {
        [K in keyof T]: Or<
            Or<Extends<'OR', K>, Extends<'AND', K>>,
            Extends<'NOT', K>
        > extends True
            ? // infer is only needed to not hit TS limit
              // based on the brilliant idea of Pierre-Antoine Mills
              // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
              T[K] extends infer TK
                ? GetHavingFields<
                      UnEnumerate<TK> extends object
                          ? Merge<UnEnumerate<TK>>
                          : never
                  >
                : never
            : {} extends FieldPaths<T[K]>
              ? never
              : K;
    }[keyof T];

    /**
     * Convert tuple to union
     */
    type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
    type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
    type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

    /**
     * Like `Pick`, but additionally can also accept an array of keys
     */
    type PickEnumerable<
        T,
        K extends Enumerable<keyof T> | keyof T
    > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

    /**
     * Exclude all keys with underscores
     */
    type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
        ? never
        : T;

    export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

    type FieldRefInputType<Model, FieldType> = Model extends never
        ? never
        : FieldRef<Model, FieldType>;

    export const ModelName: {
        User: 'User';
        Recipe: 'Recipe';
        Ingredient: 'Ingredient';
        Unit: 'Unit';
        RecipeIngredient: 'RecipeIngredient';
        Rating: 'Rating';
        Instruction: 'Instruction';
    };

    export type ModelName = (typeof ModelName)[keyof typeof ModelName];

    export type Datasources = {
        db?: Datasource;
    };

    interface TypeMapCb<ClientOptions = {}>
        extends $Utils.Fn<
            { extArgs: $Extensions.InternalArgs },
            $Utils.Record<string, any>
        > {
        returns: Prisma.TypeMap<
            this['params']['extArgs'],
            ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
        >;
    }

    export type TypeMap<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > = {
        globalOmitOptions: {
            omit: GlobalOmitOptions;
        };
        meta: {
            modelProps:
                | 'user'
                | 'recipe'
                | 'ingredient'
                | 'unit'
                | 'recipeIngredient'
                | 'rating'
                | 'instruction';
            txIsolationLevel: Prisma.TransactionIsolationLevel;
        };
        model: {
            User: {
                payload: Prisma.$UserPayload<ExtArgs>;
                fields: Prisma.UserFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.UserFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    findFirst: {
                        args: Prisma.UserFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    findMany: {
                        args: Prisma.UserFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
                    };
                    create: {
                        args: Prisma.UserCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    createMany: {
                        args: Prisma.UserCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.UserDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    update: {
                        args: Prisma.UserUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    deleteMany: {
                        args: Prisma.UserDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.UserUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.UserUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UserPayload>;
                    };
                    aggregate: {
                        args: Prisma.UserAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateUser>;
                    };
                    groupBy: {
                        args: Prisma.UserGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<UserGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.UserCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<UserCountAggregateOutputType>
                            | number;
                    };
                };
            };
            Recipe: {
                payload: Prisma.$RecipePayload<ExtArgs>;
                fields: Prisma.RecipeFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.RecipeFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.RecipeFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    findFirst: {
                        args: Prisma.RecipeFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.RecipeFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    findMany: {
                        args: Prisma.RecipeFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>[];
                    };
                    create: {
                        args: Prisma.RecipeCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    createMany: {
                        args: Prisma.RecipeCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.RecipeDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    update: {
                        args: Prisma.RecipeUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    deleteMany: {
                        args: Prisma.RecipeDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.RecipeUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.RecipeUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipePayload>;
                    };
                    aggregate: {
                        args: Prisma.RecipeAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateRecipe>;
                    };
                    groupBy: {
                        args: Prisma.RecipeGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<RecipeGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.RecipeCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<RecipeCountAggregateOutputType>
                            | number;
                    };
                };
            };
            Ingredient: {
                payload: Prisma.$IngredientPayload<ExtArgs>;
                fields: Prisma.IngredientFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.IngredientFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.IngredientFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    findFirst: {
                        args: Prisma.IngredientFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.IngredientFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    findMany: {
                        args: Prisma.IngredientFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>[];
                    };
                    create: {
                        args: Prisma.IngredientCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    createMany: {
                        args: Prisma.IngredientCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.IngredientDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    update: {
                        args: Prisma.IngredientUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    deleteMany: {
                        args: Prisma.IngredientDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.IngredientUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.IngredientUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$IngredientPayload>;
                    };
                    aggregate: {
                        args: Prisma.IngredientAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateIngredient>;
                    };
                    groupBy: {
                        args: Prisma.IngredientGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<IngredientGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.IngredientCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<IngredientCountAggregateOutputType>
                            | number;
                    };
                };
            };
            Unit: {
                payload: Prisma.$UnitPayload<ExtArgs>;
                fields: Prisma.UnitFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.UnitFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.UnitFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    findFirst: {
                        args: Prisma.UnitFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.UnitFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    findMany: {
                        args: Prisma.UnitFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>[];
                    };
                    create: {
                        args: Prisma.UnitCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    createMany: {
                        args: Prisma.UnitCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.UnitDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    update: {
                        args: Prisma.UnitUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    deleteMany: {
                        args: Prisma.UnitDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.UnitUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.UnitUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$UnitPayload>;
                    };
                    aggregate: {
                        args: Prisma.UnitAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateUnit>;
                    };
                    groupBy: {
                        args: Prisma.UnitGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<UnitGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.UnitCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<UnitCountAggregateOutputType>
                            | number;
                    };
                };
            };
            RecipeIngredient: {
                payload: Prisma.$RecipeIngredientPayload<ExtArgs>;
                fields: Prisma.RecipeIngredientFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.RecipeIngredientFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.RecipeIngredientFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    findFirst: {
                        args: Prisma.RecipeIngredientFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.RecipeIngredientFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    findMany: {
                        args: Prisma.RecipeIngredientFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>[];
                    };
                    create: {
                        args: Prisma.RecipeIngredientCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    createMany: {
                        args: Prisma.RecipeIngredientCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.RecipeIngredientDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    update: {
                        args: Prisma.RecipeIngredientUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    deleteMany: {
                        args: Prisma.RecipeIngredientDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.RecipeIngredientUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.RecipeIngredientUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                    };
                    aggregate: {
                        args: Prisma.RecipeIngredientAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateRecipeIngredient>;
                    };
                    groupBy: {
                        args: Prisma.RecipeIngredientGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<RecipeIngredientGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.RecipeIngredientCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<RecipeIngredientCountAggregateOutputType>
                            | number;
                    };
                };
            };
            Rating: {
                payload: Prisma.$RatingPayload<ExtArgs>;
                fields: Prisma.RatingFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.RatingFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.RatingFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    findFirst: {
                        args: Prisma.RatingFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.RatingFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    findMany: {
                        args: Prisma.RatingFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>[];
                    };
                    create: {
                        args: Prisma.RatingCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    createMany: {
                        args: Prisma.RatingCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.RatingDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    update: {
                        args: Prisma.RatingUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    deleteMany: {
                        args: Prisma.RatingDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.RatingUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.RatingUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$RatingPayload>;
                    };
                    aggregate: {
                        args: Prisma.RatingAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateRating>;
                    };
                    groupBy: {
                        args: Prisma.RatingGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<RatingGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.RatingCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<RatingCountAggregateOutputType>
                            | number;
                    };
                };
            };
            Instruction: {
                payload: Prisma.$InstructionPayload<ExtArgs>;
                fields: Prisma.InstructionFieldRefs;
                operations: {
                    findUnique: {
                        args: Prisma.InstructionFindUniqueArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload> | null;
                    };
                    findUniqueOrThrow: {
                        args: Prisma.InstructionFindUniqueOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    findFirst: {
                        args: Prisma.InstructionFindFirstArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload> | null;
                    };
                    findFirstOrThrow: {
                        args: Prisma.InstructionFindFirstOrThrowArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    findMany: {
                        args: Prisma.InstructionFindManyArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>[];
                    };
                    create: {
                        args: Prisma.InstructionCreateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    createMany: {
                        args: Prisma.InstructionCreateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    delete: {
                        args: Prisma.InstructionDeleteArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    update: {
                        args: Prisma.InstructionUpdateArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    deleteMany: {
                        args: Prisma.InstructionDeleteManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    updateMany: {
                        args: Prisma.InstructionUpdateManyArgs<ExtArgs>;
                        result: BatchPayload;
                    };
                    upsert: {
                        args: Prisma.InstructionUpsertArgs<ExtArgs>;
                        result: $Utils.PayloadToResult<Prisma.$InstructionPayload>;
                    };
                    aggregate: {
                        args: Prisma.InstructionAggregateArgs<ExtArgs>;
                        result: $Utils.Optional<AggregateInstruction>;
                    };
                    groupBy: {
                        args: Prisma.InstructionGroupByArgs<ExtArgs>;
                        result: $Utils.Optional<InstructionGroupByOutputType>[];
                    };
                    count: {
                        args: Prisma.InstructionCountArgs<ExtArgs>;
                        result:
                            | $Utils.Optional<InstructionCountAggregateOutputType>
                            | number;
                    };
                };
            };
        };
    } & {
        other: {
            payload: any;
            operations: {
                $executeRaw: {
                    args: [
                        query: TemplateStringsArray | Prisma.Sql,
                        ...values: any[]
                    ];
                    result: any;
                };
                $executeRawUnsafe: {
                    args: [query: string, ...values: any[]];
                    result: any;
                };
                $queryRaw: {
                    args: [
                        query: TemplateStringsArray | Prisma.Sql,
                        ...values: any[]
                    ];
                    result: any;
                };
                $queryRawUnsafe: {
                    args: [query: string, ...values: any[]];
                    result: any;
                };
            };
        };
    };
    export const defineExtension: $Extensions.ExtendsHook<
        'define',
        Prisma.TypeMapCb,
        $Extensions.DefaultArgs
    >;
    export type DefaultPrismaClient = PrismaClient;
    export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
    export interface PrismaClientOptions {
        /**
         * Overwrites the datasource url from your schema.prisma file
         */
        datasources?: Datasources;
        /**
         * Overwrites the datasource url from your schema.prisma file
         */
        datasourceUrl?: string;
        /**
         * @default "colorless"
         */
        errorFormat?: ErrorFormat;
        /**
         * @example
         * ```
         * // Defaults to stdout
         * log: ['query', 'info', 'warn', 'error']
         *
         * // Emit as events
         * log: [
         *   { emit: 'stdout', level: 'query' },
         *   { emit: 'stdout', level: 'info' },
         *   { emit: 'stdout', level: 'warn' }
         *   { emit: 'stdout', level: 'error' }
         * ]
         * ```
         * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
         */
        log?: (LogLevel | LogDefinition)[];
        /**
         * The default values for transactionOptions
         * maxWait ?= 2000
         * timeout ?= 5000
         */
        transactionOptions?: {
            maxWait?: number;
            timeout?: number;
            isolationLevel?: Prisma.TransactionIsolationLevel;
        };
        /**
         * Global configuration for omitting model fields by default.
         *
         * @example
         * ```
         * const prisma = new PrismaClient({
         *   omit: {
         *     user: {
         *       password: true
         *     }
         *   }
         * })
         * ```
         */
        omit?: Prisma.GlobalOmitConfig;
    }
    export type GlobalOmitConfig = {
        user?: UserOmit;
        recipe?: RecipeOmit;
        ingredient?: IngredientOmit;
        unit?: UnitOmit;
        recipeIngredient?: RecipeIngredientOmit;
        rating?: RatingOmit;
        instruction?: InstructionOmit;
    };

    /* Types for Logging */
    export type LogLevel = 'info' | 'query' | 'warn' | 'error';
    export type LogDefinition = {
        level: LogLevel;
        emit: 'stdout' | 'event';
    };

    export type GetLogType<T extends LogLevel | LogDefinition> =
        T extends LogDefinition
            ? T['emit'] extends 'event'
                ? T['level']
                : never
            : never;
    export type GetEvents<T extends any> =
        T extends Array<LogLevel | LogDefinition>
            ?
                  | GetLogType<T[0]>
                  | GetLogType<T[1]>
                  | GetLogType<T[2]>
                  | GetLogType<T[3]>
            : never;

    export type QueryEvent = {
        timestamp: Date;
        query: string;
        params: string;
        duration: number;
        target: string;
    };

    export type LogEvent = {
        timestamp: Date;
        message: string;
        target: string;
    };
    /* End Types for Logging */

    export type PrismaAction =
        | 'findUnique'
        | 'findUniqueOrThrow'
        | 'findMany'
        | 'findFirst'
        | 'findFirstOrThrow'
        | 'create'
        | 'createMany'
        | 'createManyAndReturn'
        | 'update'
        | 'updateMany'
        | 'updateManyAndReturn'
        | 'upsert'
        | 'delete'
        | 'deleteMany'
        | 'executeRaw'
        | 'queryRaw'
        | 'aggregate'
        | 'count'
        | 'runCommandRaw'
        | 'findRaw'
        | 'groupBy';

    /**
     * These options are being passed into the middleware as "params"
     */
    export type MiddlewareParams = {
        model?: ModelName;
        action: PrismaAction;
        args: any;
        dataPath: string[];
        runInTransaction: boolean;
    };

    /**
     * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
     */
    export type Middleware<T = any> = (
        params: MiddlewareParams,
        next: (params: MiddlewareParams) => $Utils.JsPromise<T>
    ) => $Utils.JsPromise<T>;

    // tested in getLogLevel.test.ts
    export function getLogLevel(
        log: Array<LogLevel | LogDefinition>
    ): LogLevel | undefined;

    /**
     * `PrismaClient` proxy available in interactive transactions.
     */
    export type TransactionClient = Omit<
        Prisma.DefaultPrismaClient,
        runtime.ITXClientDenyList
    >;

    export type Datasource = {
        url?: string;
    };

    /**
     * Count Types
     */

    /**
     * Models
     */

    /**
     * Model User
     */

    export type AggregateUser = {
        _count: UserCountAggregateOutputType | null;
        _avg: UserAvgAggregateOutputType | null;
        _sum: UserSumAggregateOutputType | null;
        _min: UserMinAggregateOutputType | null;
        _max: UserMaxAggregateOutputType | null;
    };

    export type UserAvgAggregateOutputType = {
        id: number | null;
    };

    export type UserSumAggregateOutputType = {
        id: number | null;
    };

    export type UserMinAggregateOutputType = {
        id: number | null;
        username: string | null;
        email: string | null;
        passwordHash: string | null;
        authType: string | null;
        role: string | null;
        status: string | null;
        avatarUrl: string | null;
        emailVerified: boolean | null;
        emailVerificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetTokenExpires: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        lastLogin: Date | null;
        lastPasswordReset: Date | null;
    };

    export type UserMaxAggregateOutputType = {
        id: number | null;
        username: string | null;
        email: string | null;
        passwordHash: string | null;
        authType: string | null;
        role: string | null;
        status: string | null;
        avatarUrl: string | null;
        emailVerified: boolean | null;
        emailVerificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetTokenExpires: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        lastLogin: Date | null;
        lastPasswordReset: Date | null;
    };

    export type UserCountAggregateOutputType = {
        id: number;
        username: number;
        email: number;
        passwordHash: number;
        authType: number;
        role: number;
        status: number;
        avatarUrl: number;
        emailVerified: number;
        emailVerificationToken: number;
        passwordResetToken: number;
        passwordResetTokenExpires: number;
        createdAt: number;
        updatedAt: number;
        lastLogin: number;
        lastPasswordReset: number;
        _all: number;
    };

    export type UserAvgAggregateInputType = {
        id?: true;
    };

    export type UserSumAggregateInputType = {
        id?: true;
    };

    export type UserMinAggregateInputType = {
        id?: true;
        username?: true;
        email?: true;
        passwordHash?: true;
        authType?: true;
        role?: true;
        status?: true;
        avatarUrl?: true;
        emailVerified?: true;
        emailVerificationToken?: true;
        passwordResetToken?: true;
        passwordResetTokenExpires?: true;
        createdAt?: true;
        updatedAt?: true;
        lastLogin?: true;
        lastPasswordReset?: true;
    };

    export type UserMaxAggregateInputType = {
        id?: true;
        username?: true;
        email?: true;
        passwordHash?: true;
        authType?: true;
        role?: true;
        status?: true;
        avatarUrl?: true;
        emailVerified?: true;
        emailVerificationToken?: true;
        passwordResetToken?: true;
        passwordResetTokenExpires?: true;
        createdAt?: true;
        updatedAt?: true;
        lastLogin?: true;
        lastPasswordReset?: true;
    };

    export type UserCountAggregateInputType = {
        id?: true;
        username?: true;
        email?: true;
        passwordHash?: true;
        authType?: true;
        role?: true;
        status?: true;
        avatarUrl?: true;
        emailVerified?: true;
        emailVerificationToken?: true;
        passwordResetToken?: true;
        passwordResetTokenExpires?: true;
        createdAt?: true;
        updatedAt?: true;
        lastLogin?: true;
        lastPasswordReset?: true;
        _all?: true;
    };

    export type UserAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which User to aggregate.
         */
        where?: UserWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Users to fetch.
         */
        orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: UserWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Users from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Users.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Users
         **/
        _count?: true | UserCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: UserAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: UserSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: UserMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: UserMaxAggregateInputType;
    };

    export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateUser[P]>
            : GetScalarType<T[P], AggregateUser[P]>;
    };

    export type UserGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: UserWhereInput;
        orderBy?:
            | UserOrderByWithAggregationInput
            | UserOrderByWithAggregationInput[];
        by: UserScalarFieldEnum[] | UserScalarFieldEnum;
        having?: UserScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: UserCountAggregateInputType | true;
        _avg?: UserAvgAggregateInputType;
        _sum?: UserSumAggregateInputType;
        _min?: UserMinAggregateInputType;
        _max?: UserMaxAggregateInputType;
    };

    export type UserGroupByOutputType = {
        id: number;
        username: string;
        email: string;
        passwordHash: string | null;
        authType: string;
        role: string;
        status: string;
        avatarUrl: string | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetTokenExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
        lastPasswordReset: Date | null;
        _count: UserCountAggregateOutputType | null;
        _avg: UserAvgAggregateOutputType | null;
        _sum: UserSumAggregateOutputType | null;
        _min: UserMinAggregateOutputType | null;
        _max: UserMaxAggregateOutputType | null;
    };

    type GetUserGroupByPayload<T extends UserGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<UserGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof UserGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<T[P], UserGroupByOutputType[P]>
                        : GetScalarType<T[P], UserGroupByOutputType[P]>;
                }
            >
        >;

    export type UserSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            username?: boolean;
            email?: boolean;
            passwordHash?: boolean;
            authType?: boolean;
            role?: boolean;
            status?: boolean;
            avatarUrl?: boolean;
            emailVerified?: boolean;
            emailVerificationToken?: boolean;
            passwordResetToken?: boolean;
            passwordResetTokenExpires?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
            lastLogin?: boolean;
            lastPasswordReset?: boolean;
        },
        ExtArgs['result']['user']
    >;

    export type UserSelectScalar = {
        id?: boolean;
        username?: boolean;
        email?: boolean;
        passwordHash?: boolean;
        authType?: boolean;
        role?: boolean;
        status?: boolean;
        avatarUrl?: boolean;
        emailVerified?: boolean;
        emailVerificationToken?: boolean;
        passwordResetToken?: boolean;
        passwordResetTokenExpires?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        lastLogin?: boolean;
        lastPasswordReset?: boolean;
    };

    export type UserOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        | 'id'
        | 'username'
        | 'email'
        | 'passwordHash'
        | 'authType'
        | 'role'
        | 'status'
        | 'avatarUrl'
        | 'emailVerified'
        | 'emailVerificationToken'
        | 'passwordResetToken'
        | 'passwordResetTokenExpires'
        | 'createdAt'
        | 'updatedAt'
        | 'lastLogin'
        | 'lastPasswordReset',
        ExtArgs['result']['user']
    >;

    export type $UserPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'User';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                username: string;
                email: string;
                passwordHash: string | null;
                authType: string;
                role: string;
                status: string;
                avatarUrl: string | null;
                emailVerified: boolean;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                passwordResetTokenExpires: Date | null;
                createdAt: Date;
                updatedAt: Date;
                lastLogin: Date | null;
                lastPasswordReset: Date | null;
            },
            ExtArgs['result']['user']
        >;
        composites: {};
    };

    type UserGetPayload<
        S extends boolean | null | undefined | UserDefaultArgs
    > = $Result.GetResult<Prisma.$UserPayload, S>;

    type UserCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
        select?: UserCountAggregateInputType | true;
    };

    export interface UserDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['User'];
            meta: { name: 'User' };
        };
        /**
         * Find zero or one User that matches the filter.
         * @param {UserFindUniqueArgs} args - Arguments to find a User
         * @example
         * // Get one User
         * const user = await prisma.user.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends UserFindUniqueArgs>(
            args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one User that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
         * @example
         * // Get one User
         * const user = await prisma.user.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
            args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first User that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserFindFirstArgs} args - Arguments to find a User
         * @example
         * // Get one User
         * const user = await prisma.user.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends UserFindFirstArgs>(
            args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first User that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
         * @example
         * // Get one User
         * const user = await prisma.user.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
            args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Users that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Users
         * const users = await prisma.user.findMany()
         *
         * // Get first 10 Users
         * const users = await prisma.user.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
         *
         */
        findMany<T extends UserFindManyArgs>(
            args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a User.
         * @param {UserCreateArgs} args - Arguments to create a User.
         * @example
         * // Create one User
         * const User = await prisma.user.create({
         *   data: {
         *     // ... data to create a User
         *   }
         * })
         *
         */
        create<T extends UserCreateArgs>(
            args: SelectSubset<T, UserCreateArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Users.
         * @param {UserCreateManyArgs} args - Arguments to create many Users.
         * @example
         * // Create many Users
         * const user = await prisma.user.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends UserCreateManyArgs>(
            args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a User.
         * @param {UserDeleteArgs} args - Arguments to delete one User.
         * @example
         * // Delete one User
         * const User = await prisma.user.delete({
         *   where: {
         *     // ... filter to delete one User
         *   }
         * })
         *
         */
        delete<T extends UserDeleteArgs>(
            args: SelectSubset<T, UserDeleteArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one User.
         * @param {UserUpdateArgs} args - Arguments to update one User.
         * @example
         * // Update one User
         * const user = await prisma.user.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends UserUpdateArgs>(
            args: SelectSubset<T, UserUpdateArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Users.
         * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
         * @example
         * // Delete a few Users
         * const { count } = await prisma.user.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends UserDeleteManyArgs>(
            args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Users.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Users
         * const user = await prisma.user.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends UserUpdateManyArgs>(
            args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one User.
         * @param {UserUpsertArgs} args - Arguments to update or create a User.
         * @example
         * // Update or create a User
         * const user = await prisma.user.upsert({
         *   create: {
         *     // ... data to create a User
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the User we want to update
         *   }
         * })
         */
        upsert<T extends UserUpsertArgs>(
            args: SelectSubset<T, UserUpsertArgs<ExtArgs>>
        ): Prisma__UserClient<
            $Result.GetResult<
                Prisma.$UserPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Users.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserCountArgs} args - Arguments to filter Users to count.
         * @example
         * // Count the number of Users
         * const count = await prisma.user.count({
         *   where: {
         *     // ... the filter for the Users we want to count
         *   }
         * })
         **/
        count<T extends UserCountArgs>(
            args?: Subset<T, UserCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<T['select'], UserCountAggregateOutputType>
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a User.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends UserAggregateArgs>(
            args: Subset<T, UserAggregateArgs>
        ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

        /**
         * Group by User.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UserGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends UserGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: UserGroupByArgs['orderBy'] }
                : { orderBy?: UserGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetUserGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the User model
         */
        readonly fields: UserFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for User.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__UserClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the User model
     */
    interface UserFieldRefs {
        readonly id: FieldRef<'User', 'Int'>;
        readonly username: FieldRef<'User', 'String'>;
        readonly email: FieldRef<'User', 'String'>;
        readonly passwordHash: FieldRef<'User', 'String'>;
        readonly authType: FieldRef<'User', 'String'>;
        readonly role: FieldRef<'User', 'String'>;
        readonly status: FieldRef<'User', 'String'>;
        readonly avatarUrl: FieldRef<'User', 'String'>;
        readonly emailVerified: FieldRef<'User', 'Boolean'>;
        readonly emailVerificationToken: FieldRef<'User', 'String'>;
        readonly passwordResetToken: FieldRef<'User', 'String'>;
        readonly passwordResetTokenExpires: FieldRef<'User', 'DateTime'>;
        readonly createdAt: FieldRef<'User', 'DateTime'>;
        readonly updatedAt: FieldRef<'User', 'DateTime'>;
        readonly lastLogin: FieldRef<'User', 'DateTime'>;
        readonly lastPasswordReset: FieldRef<'User', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * User findUnique
     */
    export type UserFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter, which User to fetch.
         */
        where: UserWhereUniqueInput;
    };

    /**
     * User findUniqueOrThrow
     */
    export type UserFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter, which User to fetch.
         */
        where: UserWhereUniqueInput;
    };

    /**
     * User findFirst
     */
    export type UserFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter, which User to fetch.
         */
        where?: UserWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Users to fetch.
         */
        orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Users.
         */
        cursor?: UserWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Users from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Users.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Users.
         */
        distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

    /**
     * User findFirstOrThrow
     */
    export type UserFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter, which User to fetch.
         */
        where?: UserWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Users to fetch.
         */
        orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Users.
         */
        cursor?: UserWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Users from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Users.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Users.
         */
        distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

    /**
     * User findMany
     */
    export type UserFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter, which Users to fetch.
         */
        where?: UserWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Users to fetch.
         */
        orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Users.
         */
        cursor?: UserWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Users from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Users.
         */
        skip?: number;
        distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

    /**
     * User create
     */
    export type UserCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * The data needed to create a User.
         */
        data: XOR<UserCreateInput, UserUncheckedCreateInput>;
    };

    /**
     * User createMany
     */
    export type UserCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Users.
         */
        data: UserCreateManyInput | UserCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * User update
     */
    export type UserUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * The data needed to update a User.
         */
        data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
        /**
         * Choose, which User to update.
         */
        where: UserWhereUniqueInput;
    };

    /**
     * User updateMany
     */
    export type UserUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Users.
         */
        data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
        /**
         * Filter which Users to update
         */
        where?: UserWhereInput;
        /**
         * Limit how many Users to update.
         */
        limit?: number;
    };

    /**
     * User upsert
     */
    export type UserUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * The filter to search for the User to update in case it exists.
         */
        where: UserWhereUniqueInput;
        /**
         * In case the User found by the `where` argument doesn't exist, create a new User with this data.
         */
        create: XOR<UserCreateInput, UserUncheckedCreateInput>;
        /**
         * In case the User was found with the provided `where` argument, update it with this data.
         */
        update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    };

    /**
     * User delete
     */
    export type UserDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
        /**
         * Filter which User to delete.
         */
        where: UserWhereUniqueInput;
    };

    /**
     * User deleteMany
     */
    export type UserDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Users to delete
         */
        where?: UserWhereInput;
        /**
         * Limit how many Users to delete.
         */
        limit?: number;
    };

    /**
     * User without action
     */
    export type UserDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the User
         */
        select?: UserSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the User
         */
        omit?: UserOmit<ExtArgs> | null;
    };

    /**
     * Model Recipe
     */

    export type AggregateRecipe = {
        _count: RecipeCountAggregateOutputType | null;
        _avg: RecipeAvgAggregateOutputType | null;
        _sum: RecipeSumAggregateOutputType | null;
        _min: RecipeMinAggregateOutputType | null;
        _max: RecipeMaxAggregateOutputType | null;
    };

    export type RecipeAvgAggregateOutputType = {
        id: number | null;
    };

    export type RecipeSumAggregateOutputType = {
        id: number | null;
    };

    export type RecipeMinAggregateOutputType = {
        id: number | null;
        title: string | null;
        description: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RecipeMaxAggregateOutputType = {
        id: number | null;
        title: string | null;
        description: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RecipeCountAggregateOutputType = {
        id: number;
        title: number;
        description: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type RecipeAvgAggregateInputType = {
        id?: true;
    };

    export type RecipeSumAggregateInputType = {
        id?: true;
    };

    export type RecipeMinAggregateInputType = {
        id?: true;
        title?: true;
        description?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RecipeMaxAggregateInputType = {
        id?: true;
        title?: true;
        description?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RecipeCountAggregateInputType = {
        id?: true;
        title?: true;
        description?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type RecipeAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Recipe to aggregate.
         */
        where?: RecipeWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Recipes to fetch.
         */
        orderBy?:
            | RecipeOrderByWithRelationInput
            | RecipeOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: RecipeWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Recipes from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Recipes.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Recipes
         **/
        _count?: true | RecipeCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: RecipeAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: RecipeSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: RecipeMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: RecipeMaxAggregateInputType;
    };

    export type GetRecipeAggregateType<T extends RecipeAggregateArgs> = {
        [P in keyof T & keyof AggregateRecipe]: P extends '_count' | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateRecipe[P]>
            : GetScalarType<T[P], AggregateRecipe[P]>;
    };

    export type RecipeGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: RecipeWhereInput;
        orderBy?:
            | RecipeOrderByWithAggregationInput
            | RecipeOrderByWithAggregationInput[];
        by: RecipeScalarFieldEnum[] | RecipeScalarFieldEnum;
        having?: RecipeScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: RecipeCountAggregateInputType | true;
        _avg?: RecipeAvgAggregateInputType;
        _sum?: RecipeSumAggregateInputType;
        _min?: RecipeMinAggregateInputType;
        _max?: RecipeMaxAggregateInputType;
    };

    export type RecipeGroupByOutputType = {
        id: number;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        _count: RecipeCountAggregateOutputType | null;
        _avg: RecipeAvgAggregateOutputType | null;
        _sum: RecipeSumAggregateOutputType | null;
        _min: RecipeMinAggregateOutputType | null;
        _max: RecipeMaxAggregateOutputType | null;
    };

    type GetRecipeGroupByPayload<T extends RecipeGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<RecipeGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof RecipeGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<T[P], RecipeGroupByOutputType[P]>
                        : GetScalarType<T[P], RecipeGroupByOutputType[P]>;
                }
            >
        >;

    export type RecipeSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            title?: boolean;
            description?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['recipe']
    >;

    export type RecipeSelectScalar = {
        id?: boolean;
        title?: boolean;
        description?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type RecipeOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        'id' | 'title' | 'description' | 'createdAt' | 'updatedAt',
        ExtArgs['result']['recipe']
    >;

    export type $RecipePayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'Recipe';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                title: string;
                description: string;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['recipe']
        >;
        composites: {};
    };

    type RecipeGetPayload<
        S extends boolean | null | undefined | RecipeDefaultArgs
    > = $Result.GetResult<Prisma.$RecipePayload, S>;

    type RecipeCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<RecipeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
        select?: RecipeCountAggregateInputType | true;
    };

    export interface RecipeDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['Recipe'];
            meta: { name: 'Recipe' };
        };
        /**
         * Find zero or one Recipe that matches the filter.
         * @param {RecipeFindUniqueArgs} args - Arguments to find a Recipe
         * @example
         * // Get one Recipe
         * const recipe = await prisma.recipe.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends RecipeFindUniqueArgs>(
            args: SelectSubset<T, RecipeFindUniqueArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one Recipe that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {RecipeFindUniqueOrThrowArgs} args - Arguments to find a Recipe
         * @example
         * // Get one Recipe
         * const recipe = await prisma.recipe.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends RecipeFindUniqueOrThrowArgs>(
            args: SelectSubset<T, RecipeFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Recipe that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeFindFirstArgs} args - Arguments to find a Recipe
         * @example
         * // Get one Recipe
         * const recipe = await prisma.recipe.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends RecipeFindFirstArgs>(
            args?: SelectSubset<T, RecipeFindFirstArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Recipe that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeFindFirstOrThrowArgs} args - Arguments to find a Recipe
         * @example
         * // Get one Recipe
         * const recipe = await prisma.recipe.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends RecipeFindFirstOrThrowArgs>(
            args?: SelectSubset<T, RecipeFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Recipes that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Recipes
         * const recipes = await prisma.recipe.findMany()
         *
         * // Get first 10 Recipes
         * const recipes = await prisma.recipe.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const recipeWithIdOnly = await prisma.recipe.findMany({ select: { id: true } })
         *
         */
        findMany<T extends RecipeFindManyArgs>(
            args?: SelectSubset<T, RecipeFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a Recipe.
         * @param {RecipeCreateArgs} args - Arguments to create a Recipe.
         * @example
         * // Create one Recipe
         * const Recipe = await prisma.recipe.create({
         *   data: {
         *     // ... data to create a Recipe
         *   }
         * })
         *
         */
        create<T extends RecipeCreateArgs>(
            args: SelectSubset<T, RecipeCreateArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Recipes.
         * @param {RecipeCreateManyArgs} args - Arguments to create many Recipes.
         * @example
         * // Create many Recipes
         * const recipe = await prisma.recipe.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends RecipeCreateManyArgs>(
            args?: SelectSubset<T, RecipeCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a Recipe.
         * @param {RecipeDeleteArgs} args - Arguments to delete one Recipe.
         * @example
         * // Delete one Recipe
         * const Recipe = await prisma.recipe.delete({
         *   where: {
         *     // ... filter to delete one Recipe
         *   }
         * })
         *
         */
        delete<T extends RecipeDeleteArgs>(
            args: SelectSubset<T, RecipeDeleteArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one Recipe.
         * @param {RecipeUpdateArgs} args - Arguments to update one Recipe.
         * @example
         * // Update one Recipe
         * const recipe = await prisma.recipe.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends RecipeUpdateArgs>(
            args: SelectSubset<T, RecipeUpdateArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Recipes.
         * @param {RecipeDeleteManyArgs} args - Arguments to filter Recipes to delete.
         * @example
         * // Delete a few Recipes
         * const { count } = await prisma.recipe.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends RecipeDeleteManyArgs>(
            args?: SelectSubset<T, RecipeDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Recipes.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Recipes
         * const recipe = await prisma.recipe.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends RecipeUpdateManyArgs>(
            args: SelectSubset<T, RecipeUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one Recipe.
         * @param {RecipeUpsertArgs} args - Arguments to update or create a Recipe.
         * @example
         * // Update or create a Recipe
         * const recipe = await prisma.recipe.upsert({
         *   create: {
         *     // ... data to create a Recipe
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the Recipe we want to update
         *   }
         * })
         */
        upsert<T extends RecipeUpsertArgs>(
            args: SelectSubset<T, RecipeUpsertArgs<ExtArgs>>
        ): Prisma__RecipeClient<
            $Result.GetResult<
                Prisma.$RecipePayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Recipes.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeCountArgs} args - Arguments to filter Recipes to count.
         * @example
         * // Count the number of Recipes
         * const count = await prisma.recipe.count({
         *   where: {
         *     // ... the filter for the Recipes we want to count
         *   }
         * })
         **/
        count<T extends RecipeCountArgs>(
            args?: Subset<T, RecipeCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<T['select'], RecipeCountAggregateOutputType>
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a Recipe.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends RecipeAggregateArgs>(
            args: Subset<T, RecipeAggregateArgs>
        ): Prisma.PrismaPromise<GetRecipeAggregateType<T>>;

        /**
         * Group by Recipe.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends RecipeGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: RecipeGroupByArgs['orderBy'] }
                : { orderBy?: RecipeGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, RecipeGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetRecipeGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the Recipe model
         */
        readonly fields: RecipeFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for Recipe.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__RecipeClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the Recipe model
     */
    interface RecipeFieldRefs {
        readonly id: FieldRef<'Recipe', 'Int'>;
        readonly title: FieldRef<'Recipe', 'String'>;
        readonly description: FieldRef<'Recipe', 'String'>;
        readonly createdAt: FieldRef<'Recipe', 'DateTime'>;
        readonly updatedAt: FieldRef<'Recipe', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * Recipe findUnique
     */
    export type RecipeFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter, which Recipe to fetch.
         */
        where: RecipeWhereUniqueInput;
    };

    /**
     * Recipe findUniqueOrThrow
     */
    export type RecipeFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter, which Recipe to fetch.
         */
        where: RecipeWhereUniqueInput;
    };

    /**
     * Recipe findFirst
     */
    export type RecipeFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter, which Recipe to fetch.
         */
        where?: RecipeWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Recipes to fetch.
         */
        orderBy?:
            | RecipeOrderByWithRelationInput
            | RecipeOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Recipes.
         */
        cursor?: RecipeWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Recipes from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Recipes.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Recipes.
         */
        distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[];
    };

    /**
     * Recipe findFirstOrThrow
     */
    export type RecipeFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter, which Recipe to fetch.
         */
        where?: RecipeWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Recipes to fetch.
         */
        orderBy?:
            | RecipeOrderByWithRelationInput
            | RecipeOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Recipes.
         */
        cursor?: RecipeWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Recipes from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Recipes.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Recipes.
         */
        distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[];
    };

    /**
     * Recipe findMany
     */
    export type RecipeFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter, which Recipes to fetch.
         */
        where?: RecipeWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Recipes to fetch.
         */
        orderBy?:
            | RecipeOrderByWithRelationInput
            | RecipeOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Recipes.
         */
        cursor?: RecipeWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Recipes from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Recipes.
         */
        skip?: number;
        distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[];
    };

    /**
     * Recipe create
     */
    export type RecipeCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * The data needed to create a Recipe.
         */
        data: XOR<RecipeCreateInput, RecipeUncheckedCreateInput>;
    };

    /**
     * Recipe createMany
     */
    export type RecipeCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Recipes.
         */
        data: RecipeCreateManyInput | RecipeCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * Recipe update
     */
    export type RecipeUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * The data needed to update a Recipe.
         */
        data: XOR<RecipeUpdateInput, RecipeUncheckedUpdateInput>;
        /**
         * Choose, which Recipe to update.
         */
        where: RecipeWhereUniqueInput;
    };

    /**
     * Recipe updateMany
     */
    export type RecipeUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Recipes.
         */
        data: XOR<
            RecipeUpdateManyMutationInput,
            RecipeUncheckedUpdateManyInput
        >;
        /**
         * Filter which Recipes to update
         */
        where?: RecipeWhereInput;
        /**
         * Limit how many Recipes to update.
         */
        limit?: number;
    };

    /**
     * Recipe upsert
     */
    export type RecipeUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * The filter to search for the Recipe to update in case it exists.
         */
        where: RecipeWhereUniqueInput;
        /**
         * In case the Recipe found by the `where` argument doesn't exist, create a new Recipe with this data.
         */
        create: XOR<RecipeCreateInput, RecipeUncheckedCreateInput>;
        /**
         * In case the Recipe was found with the provided `where` argument, update it with this data.
         */
        update: XOR<RecipeUpdateInput, RecipeUncheckedUpdateInput>;
    };

    /**
     * Recipe delete
     */
    export type RecipeDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
        /**
         * Filter which Recipe to delete.
         */
        where: RecipeWhereUniqueInput;
    };

    /**
     * Recipe deleteMany
     */
    export type RecipeDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Recipes to delete
         */
        where?: RecipeWhereInput;
        /**
         * Limit how many Recipes to delete.
         */
        limit?: number;
    };

    /**
     * Recipe without action
     */
    export type RecipeDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Recipe
         */
        select?: RecipeSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Recipe
         */
        omit?: RecipeOmit<ExtArgs> | null;
    };

    /**
     * Model Ingredient
     */

    export type AggregateIngredient = {
        _count: IngredientCountAggregateOutputType | null;
        _avg: IngredientAvgAggregateOutputType | null;
        _sum: IngredientSumAggregateOutputType | null;
        _min: IngredientMinAggregateOutputType | null;
        _max: IngredientMaxAggregateOutputType | null;
    };

    export type IngredientAvgAggregateOutputType = {
        id: number | null;
    };

    export type IngredientSumAggregateOutputType = {
        id: number | null;
    };

    export type IngredientMinAggregateOutputType = {
        id: number | null;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type IngredientMaxAggregateOutputType = {
        id: number | null;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type IngredientCountAggregateOutputType = {
        id: number;
        name: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type IngredientAvgAggregateInputType = {
        id?: true;
    };

    export type IngredientSumAggregateInputType = {
        id?: true;
    };

    export type IngredientMinAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type IngredientMaxAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type IngredientCountAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type IngredientAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Ingredient to aggregate.
         */
        where?: IngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ingredients to fetch.
         */
        orderBy?:
            | IngredientOrderByWithRelationInput
            | IngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: IngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ingredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ingredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Ingredients
         **/
        _count?: true | IngredientCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: IngredientAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: IngredientSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: IngredientMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: IngredientMaxAggregateInputType;
    };

    export type GetIngredientAggregateType<T extends IngredientAggregateArgs> =
        {
            [P in keyof T & keyof AggregateIngredient]: P extends
                | '_count'
                | 'count'
                ? T[P] extends true
                    ? number
                    : GetScalarType<T[P], AggregateIngredient[P]>
                : GetScalarType<T[P], AggregateIngredient[P]>;
        };

    export type IngredientGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: IngredientWhereInput;
        orderBy?:
            | IngredientOrderByWithAggregationInput
            | IngredientOrderByWithAggregationInput[];
        by: IngredientScalarFieldEnum[] | IngredientScalarFieldEnum;
        having?: IngredientScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: IngredientCountAggregateInputType | true;
        _avg?: IngredientAvgAggregateInputType;
        _sum?: IngredientSumAggregateInputType;
        _min?: IngredientMinAggregateInputType;
        _max?: IngredientMaxAggregateInputType;
    };

    export type IngredientGroupByOutputType = {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        _count: IngredientCountAggregateOutputType | null;
        _avg: IngredientAvgAggregateOutputType | null;
        _sum: IngredientSumAggregateOutputType | null;
        _min: IngredientMinAggregateOutputType | null;
        _max: IngredientMaxAggregateOutputType | null;
    };

    type GetIngredientGroupByPayload<T extends IngredientGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<IngredientGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof IngredientGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<
                                  T[P],
                                  IngredientGroupByOutputType[P]
                              >
                        : GetScalarType<T[P], IngredientGroupByOutputType[P]>;
                }
            >
        >;

    export type IngredientSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            name?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['ingredient']
    >;

    export type IngredientSelectScalar = {
        id?: boolean;
        name?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type IngredientOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        'id' | 'name' | 'createdAt' | 'updatedAt',
        ExtArgs['result']['ingredient']
    >;

    export type $IngredientPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'Ingredient';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['ingredient']
        >;
        composites: {};
    };

    type IngredientGetPayload<
        S extends boolean | null | undefined | IngredientDefaultArgs
    > = $Result.GetResult<Prisma.$IngredientPayload, S>;

    type IngredientCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<
        IngredientFindManyArgs,
        'select' | 'include' | 'distinct' | 'omit'
    > & {
        select?: IngredientCountAggregateInputType | true;
    };

    export interface IngredientDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['Ingredient'];
            meta: { name: 'Ingredient' };
        };
        /**
         * Find zero or one Ingredient that matches the filter.
         * @param {IngredientFindUniqueArgs} args - Arguments to find a Ingredient
         * @example
         * // Get one Ingredient
         * const ingredient = await prisma.ingredient.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends IngredientFindUniqueArgs>(
            args: SelectSubset<T, IngredientFindUniqueArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one Ingredient that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {IngredientFindUniqueOrThrowArgs} args - Arguments to find a Ingredient
         * @example
         * // Get one Ingredient
         * const ingredient = await prisma.ingredient.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends IngredientFindUniqueOrThrowArgs>(
            args: SelectSubset<T, IngredientFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Ingredient that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientFindFirstArgs} args - Arguments to find a Ingredient
         * @example
         * // Get one Ingredient
         * const ingredient = await prisma.ingredient.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends IngredientFindFirstArgs>(
            args?: SelectSubset<T, IngredientFindFirstArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Ingredient that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientFindFirstOrThrowArgs} args - Arguments to find a Ingredient
         * @example
         * // Get one Ingredient
         * const ingredient = await prisma.ingredient.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends IngredientFindFirstOrThrowArgs>(
            args?: SelectSubset<T, IngredientFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Ingredients that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Ingredients
         * const ingredients = await prisma.ingredient.findMany()
         *
         * // Get first 10 Ingredients
         * const ingredients = await prisma.ingredient.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const ingredientWithIdOnly = await prisma.ingredient.findMany({ select: { id: true } })
         *
         */
        findMany<T extends IngredientFindManyArgs>(
            args?: SelectSubset<T, IngredientFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a Ingredient.
         * @param {IngredientCreateArgs} args - Arguments to create a Ingredient.
         * @example
         * // Create one Ingredient
         * const Ingredient = await prisma.ingredient.create({
         *   data: {
         *     // ... data to create a Ingredient
         *   }
         * })
         *
         */
        create<T extends IngredientCreateArgs>(
            args: SelectSubset<T, IngredientCreateArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Ingredients.
         * @param {IngredientCreateManyArgs} args - Arguments to create many Ingredients.
         * @example
         * // Create many Ingredients
         * const ingredient = await prisma.ingredient.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends IngredientCreateManyArgs>(
            args?: SelectSubset<T, IngredientCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a Ingredient.
         * @param {IngredientDeleteArgs} args - Arguments to delete one Ingredient.
         * @example
         * // Delete one Ingredient
         * const Ingredient = await prisma.ingredient.delete({
         *   where: {
         *     // ... filter to delete one Ingredient
         *   }
         * })
         *
         */
        delete<T extends IngredientDeleteArgs>(
            args: SelectSubset<T, IngredientDeleteArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one Ingredient.
         * @param {IngredientUpdateArgs} args - Arguments to update one Ingredient.
         * @example
         * // Update one Ingredient
         * const ingredient = await prisma.ingredient.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends IngredientUpdateArgs>(
            args: SelectSubset<T, IngredientUpdateArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Ingredients.
         * @param {IngredientDeleteManyArgs} args - Arguments to filter Ingredients to delete.
         * @example
         * // Delete a few Ingredients
         * const { count } = await prisma.ingredient.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends IngredientDeleteManyArgs>(
            args?: SelectSubset<T, IngredientDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Ingredients.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Ingredients
         * const ingredient = await prisma.ingredient.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends IngredientUpdateManyArgs>(
            args: SelectSubset<T, IngredientUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one Ingredient.
         * @param {IngredientUpsertArgs} args - Arguments to update or create a Ingredient.
         * @example
         * // Update or create a Ingredient
         * const ingredient = await prisma.ingredient.upsert({
         *   create: {
         *     // ... data to create a Ingredient
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the Ingredient we want to update
         *   }
         * })
         */
        upsert<T extends IngredientUpsertArgs>(
            args: SelectSubset<T, IngredientUpsertArgs<ExtArgs>>
        ): Prisma__IngredientClient<
            $Result.GetResult<
                Prisma.$IngredientPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Ingredients.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientCountArgs} args - Arguments to filter Ingredients to count.
         * @example
         * // Count the number of Ingredients
         * const count = await prisma.ingredient.count({
         *   where: {
         *     // ... the filter for the Ingredients we want to count
         *   }
         * })
         **/
        count<T extends IngredientCountArgs>(
            args?: Subset<T, IngredientCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<
                          T['select'],
                          IngredientCountAggregateOutputType
                      >
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a Ingredient.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends IngredientAggregateArgs>(
            args: Subset<T, IngredientAggregateArgs>
        ): Prisma.PrismaPromise<GetIngredientAggregateType<T>>;

        /**
         * Group by Ingredient.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {IngredientGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends IngredientGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: IngredientGroupByArgs['orderBy'] }
                : { orderBy?: IngredientGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, IngredientGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetIngredientGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the Ingredient model
         */
        readonly fields: IngredientFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for Ingredient.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__IngredientClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the Ingredient model
     */
    interface IngredientFieldRefs {
        readonly id: FieldRef<'Ingredient', 'Int'>;
        readonly name: FieldRef<'Ingredient', 'String'>;
        readonly createdAt: FieldRef<'Ingredient', 'DateTime'>;
        readonly updatedAt: FieldRef<'Ingredient', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * Ingredient findUnique
     */
    export type IngredientFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter, which Ingredient to fetch.
         */
        where: IngredientWhereUniqueInput;
    };

    /**
     * Ingredient findUniqueOrThrow
     */
    export type IngredientFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter, which Ingredient to fetch.
         */
        where: IngredientWhereUniqueInput;
    };

    /**
     * Ingredient findFirst
     */
    export type IngredientFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter, which Ingredient to fetch.
         */
        where?: IngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ingredients to fetch.
         */
        orderBy?:
            | IngredientOrderByWithRelationInput
            | IngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Ingredients.
         */
        cursor?: IngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ingredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ingredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Ingredients.
         */
        distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[];
    };

    /**
     * Ingredient findFirstOrThrow
     */
    export type IngredientFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter, which Ingredient to fetch.
         */
        where?: IngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ingredients to fetch.
         */
        orderBy?:
            | IngredientOrderByWithRelationInput
            | IngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Ingredients.
         */
        cursor?: IngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ingredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ingredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Ingredients.
         */
        distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[];
    };

    /**
     * Ingredient findMany
     */
    export type IngredientFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter, which Ingredients to fetch.
         */
        where?: IngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ingredients to fetch.
         */
        orderBy?:
            | IngredientOrderByWithRelationInput
            | IngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Ingredients.
         */
        cursor?: IngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ingredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ingredients.
         */
        skip?: number;
        distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[];
    };

    /**
     * Ingredient create
     */
    export type IngredientCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * The data needed to create a Ingredient.
         */
        data: XOR<IngredientCreateInput, IngredientUncheckedCreateInput>;
    };

    /**
     * Ingredient createMany
     */
    export type IngredientCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Ingredients.
         */
        data: IngredientCreateManyInput | IngredientCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * Ingredient update
     */
    export type IngredientUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * The data needed to update a Ingredient.
         */
        data: XOR<IngredientUpdateInput, IngredientUncheckedUpdateInput>;
        /**
         * Choose, which Ingredient to update.
         */
        where: IngredientWhereUniqueInput;
    };

    /**
     * Ingredient updateMany
     */
    export type IngredientUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Ingredients.
         */
        data: XOR<
            IngredientUpdateManyMutationInput,
            IngredientUncheckedUpdateManyInput
        >;
        /**
         * Filter which Ingredients to update
         */
        where?: IngredientWhereInput;
        /**
         * Limit how many Ingredients to update.
         */
        limit?: number;
    };

    /**
     * Ingredient upsert
     */
    export type IngredientUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * The filter to search for the Ingredient to update in case it exists.
         */
        where: IngredientWhereUniqueInput;
        /**
         * In case the Ingredient found by the `where` argument doesn't exist, create a new Ingredient with this data.
         */
        create: XOR<IngredientCreateInput, IngredientUncheckedCreateInput>;
        /**
         * In case the Ingredient was found with the provided `where` argument, update it with this data.
         */
        update: XOR<IngredientUpdateInput, IngredientUncheckedUpdateInput>;
    };

    /**
     * Ingredient delete
     */
    export type IngredientDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
        /**
         * Filter which Ingredient to delete.
         */
        where: IngredientWhereUniqueInput;
    };

    /**
     * Ingredient deleteMany
     */
    export type IngredientDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Ingredients to delete
         */
        where?: IngredientWhereInput;
        /**
         * Limit how many Ingredients to delete.
         */
        limit?: number;
    };

    /**
     * Ingredient without action
     */
    export type IngredientDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Ingredient
         */
        select?: IngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Ingredient
         */
        omit?: IngredientOmit<ExtArgs> | null;
    };

    /**
     * Model Unit
     */

    export type AggregateUnit = {
        _count: UnitCountAggregateOutputType | null;
        _avg: UnitAvgAggregateOutputType | null;
        _sum: UnitSumAggregateOutputType | null;
        _min: UnitMinAggregateOutputType | null;
        _max: UnitMaxAggregateOutputType | null;
    };

    export type UnitAvgAggregateOutputType = {
        id: number | null;
    };

    export type UnitSumAggregateOutputType = {
        id: number | null;
    };

    export type UnitMinAggregateOutputType = {
        id: number | null;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type UnitMaxAggregateOutputType = {
        id: number | null;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type UnitCountAggregateOutputType = {
        id: number;
        name: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type UnitAvgAggregateInputType = {
        id?: true;
    };

    export type UnitSumAggregateInputType = {
        id?: true;
    };

    export type UnitMinAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type UnitMaxAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type UnitCountAggregateInputType = {
        id?: true;
        name?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type UnitAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Unit to aggregate.
         */
        where?: UnitWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Units to fetch.
         */
        orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: UnitWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Units from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Units.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Units
         **/
        _count?: true | UnitCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: UnitAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: UnitSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: UnitMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: UnitMaxAggregateInputType;
    };

    export type GetUnitAggregateType<T extends UnitAggregateArgs> = {
        [P in keyof T & keyof AggregateUnit]: P extends '_count' | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateUnit[P]>
            : GetScalarType<T[P], AggregateUnit[P]>;
    };

    export type UnitGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: UnitWhereInput;
        orderBy?:
            | UnitOrderByWithAggregationInput
            | UnitOrderByWithAggregationInput[];
        by: UnitScalarFieldEnum[] | UnitScalarFieldEnum;
        having?: UnitScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: UnitCountAggregateInputType | true;
        _avg?: UnitAvgAggregateInputType;
        _sum?: UnitSumAggregateInputType;
        _min?: UnitMinAggregateInputType;
        _max?: UnitMaxAggregateInputType;
    };

    export type UnitGroupByOutputType = {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        _count: UnitCountAggregateOutputType | null;
        _avg: UnitAvgAggregateOutputType | null;
        _sum: UnitSumAggregateOutputType | null;
        _min: UnitMinAggregateOutputType | null;
        _max: UnitMaxAggregateOutputType | null;
    };

    type GetUnitGroupByPayload<T extends UnitGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<UnitGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof UnitGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<T[P], UnitGroupByOutputType[P]>
                        : GetScalarType<T[P], UnitGroupByOutputType[P]>;
                }
            >
        >;

    export type UnitSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            name?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['unit']
    >;

    export type UnitSelectScalar = {
        id?: boolean;
        name?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type UnitOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        'id' | 'name' | 'createdAt' | 'updatedAt',
        ExtArgs['result']['unit']
    >;

    export type $UnitPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'Unit';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['unit']
        >;
        composites: {};
    };

    type UnitGetPayload<
        S extends boolean | null | undefined | UnitDefaultArgs
    > = $Result.GetResult<Prisma.$UnitPayload, S>;

    type UnitCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<UnitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
        select?: UnitCountAggregateInputType | true;
    };

    export interface UnitDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['Unit'];
            meta: { name: 'Unit' };
        };
        /**
         * Find zero or one Unit that matches the filter.
         * @param {UnitFindUniqueArgs} args - Arguments to find a Unit
         * @example
         * // Get one Unit
         * const unit = await prisma.unit.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends UnitFindUniqueArgs>(
            args: SelectSubset<T, UnitFindUniqueArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one Unit that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {UnitFindUniqueOrThrowArgs} args - Arguments to find a Unit
         * @example
         * // Get one Unit
         * const unit = await prisma.unit.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends UnitFindUniqueOrThrowArgs>(
            args: SelectSubset<T, UnitFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Unit that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitFindFirstArgs} args - Arguments to find a Unit
         * @example
         * // Get one Unit
         * const unit = await prisma.unit.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends UnitFindFirstArgs>(
            args?: SelectSubset<T, UnitFindFirstArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Unit that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitFindFirstOrThrowArgs} args - Arguments to find a Unit
         * @example
         * // Get one Unit
         * const unit = await prisma.unit.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends UnitFindFirstOrThrowArgs>(
            args?: SelectSubset<T, UnitFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Units that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Units
         * const units = await prisma.unit.findMany()
         *
         * // Get first 10 Units
         * const units = await prisma.unit.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const unitWithIdOnly = await prisma.unit.findMany({ select: { id: true } })
         *
         */
        findMany<T extends UnitFindManyArgs>(
            args?: SelectSubset<T, UnitFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a Unit.
         * @param {UnitCreateArgs} args - Arguments to create a Unit.
         * @example
         * // Create one Unit
         * const Unit = await prisma.unit.create({
         *   data: {
         *     // ... data to create a Unit
         *   }
         * })
         *
         */
        create<T extends UnitCreateArgs>(
            args: SelectSubset<T, UnitCreateArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Units.
         * @param {UnitCreateManyArgs} args - Arguments to create many Units.
         * @example
         * // Create many Units
         * const unit = await prisma.unit.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends UnitCreateManyArgs>(
            args?: SelectSubset<T, UnitCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a Unit.
         * @param {UnitDeleteArgs} args - Arguments to delete one Unit.
         * @example
         * // Delete one Unit
         * const Unit = await prisma.unit.delete({
         *   where: {
         *     // ... filter to delete one Unit
         *   }
         * })
         *
         */
        delete<T extends UnitDeleteArgs>(
            args: SelectSubset<T, UnitDeleteArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one Unit.
         * @param {UnitUpdateArgs} args - Arguments to update one Unit.
         * @example
         * // Update one Unit
         * const unit = await prisma.unit.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends UnitUpdateArgs>(
            args: SelectSubset<T, UnitUpdateArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Units.
         * @param {UnitDeleteManyArgs} args - Arguments to filter Units to delete.
         * @example
         * // Delete a few Units
         * const { count } = await prisma.unit.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends UnitDeleteManyArgs>(
            args?: SelectSubset<T, UnitDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Units.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Units
         * const unit = await prisma.unit.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends UnitUpdateManyArgs>(
            args: SelectSubset<T, UnitUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one Unit.
         * @param {UnitUpsertArgs} args - Arguments to update or create a Unit.
         * @example
         * // Update or create a Unit
         * const unit = await prisma.unit.upsert({
         *   create: {
         *     // ... data to create a Unit
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the Unit we want to update
         *   }
         * })
         */
        upsert<T extends UnitUpsertArgs>(
            args: SelectSubset<T, UnitUpsertArgs<ExtArgs>>
        ): Prisma__UnitClient<
            $Result.GetResult<
                Prisma.$UnitPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Units.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitCountArgs} args - Arguments to filter Units to count.
         * @example
         * // Count the number of Units
         * const count = await prisma.unit.count({
         *   where: {
         *     // ... the filter for the Units we want to count
         *   }
         * })
         **/
        count<T extends UnitCountArgs>(
            args?: Subset<T, UnitCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<T['select'], UnitCountAggregateOutputType>
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a Unit.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends UnitAggregateArgs>(
            args: Subset<T, UnitAggregateArgs>
        ): Prisma.PrismaPromise<GetUnitAggregateType<T>>;

        /**
         * Group by Unit.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {UnitGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends UnitGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: UnitGroupByArgs['orderBy'] }
                : { orderBy?: UnitGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, UnitGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetUnitGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the Unit model
         */
        readonly fields: UnitFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for Unit.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__UnitClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the Unit model
     */
    interface UnitFieldRefs {
        readonly id: FieldRef<'Unit', 'Int'>;
        readonly name: FieldRef<'Unit', 'String'>;
        readonly createdAt: FieldRef<'Unit', 'DateTime'>;
        readonly updatedAt: FieldRef<'Unit', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * Unit findUnique
     */
    export type UnitFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter, which Unit to fetch.
         */
        where: UnitWhereUniqueInput;
    };

    /**
     * Unit findUniqueOrThrow
     */
    export type UnitFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter, which Unit to fetch.
         */
        where: UnitWhereUniqueInput;
    };

    /**
     * Unit findFirst
     */
    export type UnitFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter, which Unit to fetch.
         */
        where?: UnitWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Units to fetch.
         */
        orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Units.
         */
        cursor?: UnitWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Units from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Units.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Units.
         */
        distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[];
    };

    /**
     * Unit findFirstOrThrow
     */
    export type UnitFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter, which Unit to fetch.
         */
        where?: UnitWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Units to fetch.
         */
        orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Units.
         */
        cursor?: UnitWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Units from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Units.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Units.
         */
        distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[];
    };

    /**
     * Unit findMany
     */
    export type UnitFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter, which Units to fetch.
         */
        where?: UnitWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Units to fetch.
         */
        orderBy?: UnitOrderByWithRelationInput | UnitOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Units.
         */
        cursor?: UnitWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Units from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Units.
         */
        skip?: number;
        distinct?: UnitScalarFieldEnum | UnitScalarFieldEnum[];
    };

    /**
     * Unit create
     */
    export type UnitCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * The data needed to create a Unit.
         */
        data: XOR<UnitCreateInput, UnitUncheckedCreateInput>;
    };

    /**
     * Unit createMany
     */
    export type UnitCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Units.
         */
        data: UnitCreateManyInput | UnitCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * Unit update
     */
    export type UnitUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * The data needed to update a Unit.
         */
        data: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>;
        /**
         * Choose, which Unit to update.
         */
        where: UnitWhereUniqueInput;
    };

    /**
     * Unit updateMany
     */
    export type UnitUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Units.
         */
        data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyInput>;
        /**
         * Filter which Units to update
         */
        where?: UnitWhereInput;
        /**
         * Limit how many Units to update.
         */
        limit?: number;
    };

    /**
     * Unit upsert
     */
    export type UnitUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * The filter to search for the Unit to update in case it exists.
         */
        where: UnitWhereUniqueInput;
        /**
         * In case the Unit found by the `where` argument doesn't exist, create a new Unit with this data.
         */
        create: XOR<UnitCreateInput, UnitUncheckedCreateInput>;
        /**
         * In case the Unit was found with the provided `where` argument, update it with this data.
         */
        update: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>;
    };

    /**
     * Unit delete
     */
    export type UnitDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
        /**
         * Filter which Unit to delete.
         */
        where: UnitWhereUniqueInput;
    };

    /**
     * Unit deleteMany
     */
    export type UnitDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Units to delete
         */
        where?: UnitWhereInput;
        /**
         * Limit how many Units to delete.
         */
        limit?: number;
    };

    /**
     * Unit without action
     */
    export type UnitDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Unit
         */
        select?: UnitSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Unit
         */
        omit?: UnitOmit<ExtArgs> | null;
    };

    /**
     * Model RecipeIngredient
     */

    export type AggregateRecipeIngredient = {
        _count: RecipeIngredientCountAggregateOutputType | null;
        _avg: RecipeIngredientAvgAggregateOutputType | null;
        _sum: RecipeIngredientSumAggregateOutputType | null;
        _min: RecipeIngredientMinAggregateOutputType | null;
        _max: RecipeIngredientMaxAggregateOutputType | null;
    };

    export type RecipeIngredientAvgAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        ingredientId: number | null;
    };

    export type RecipeIngredientSumAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        ingredientId: number | null;
    };

    export type RecipeIngredientMinAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        ingredientId: number | null;
        quantity: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RecipeIngredientMaxAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        ingredientId: number | null;
        quantity: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RecipeIngredientCountAggregateOutputType = {
        id: number;
        recipeId: number;
        ingredientId: number;
        quantity: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type RecipeIngredientAvgAggregateInputType = {
        id?: true;
        recipeId?: true;
        ingredientId?: true;
    };

    export type RecipeIngredientSumAggregateInputType = {
        id?: true;
        recipeId?: true;
        ingredientId?: true;
    };

    export type RecipeIngredientMinAggregateInputType = {
        id?: true;
        recipeId?: true;
        ingredientId?: true;
        quantity?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RecipeIngredientMaxAggregateInputType = {
        id?: true;
        recipeId?: true;
        ingredientId?: true;
        quantity?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RecipeIngredientCountAggregateInputType = {
        id?: true;
        recipeId?: true;
        ingredientId?: true;
        quantity?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type RecipeIngredientAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which RecipeIngredient to aggregate.
         */
        where?: RecipeIngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of RecipeIngredients to fetch.
         */
        orderBy?:
            | RecipeIngredientOrderByWithRelationInput
            | RecipeIngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: RecipeIngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` RecipeIngredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` RecipeIngredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned RecipeIngredients
         **/
        _count?: true | RecipeIngredientCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: RecipeIngredientAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: RecipeIngredientSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: RecipeIngredientMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: RecipeIngredientMaxAggregateInputType;
    };

    export type GetRecipeIngredientAggregateType<
        T extends RecipeIngredientAggregateArgs
    > = {
        [P in keyof T & keyof AggregateRecipeIngredient]: P extends
            | '_count'
            | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateRecipeIngredient[P]>
            : GetScalarType<T[P], AggregateRecipeIngredient[P]>;
    };

    export type RecipeIngredientGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: RecipeIngredientWhereInput;
        orderBy?:
            | RecipeIngredientOrderByWithAggregationInput
            | RecipeIngredientOrderByWithAggregationInput[];
        by: RecipeIngredientScalarFieldEnum[] | RecipeIngredientScalarFieldEnum;
        having?: RecipeIngredientScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: RecipeIngredientCountAggregateInputType | true;
        _avg?: RecipeIngredientAvgAggregateInputType;
        _sum?: RecipeIngredientSumAggregateInputType;
        _min?: RecipeIngredientMinAggregateInputType;
        _max?: RecipeIngredientMaxAggregateInputType;
    };

    export type RecipeIngredientGroupByOutputType = {
        id: number;
        recipeId: number;
        ingredientId: number;
        quantity: string;
        createdAt: Date;
        updatedAt: Date;
        _count: RecipeIngredientCountAggregateOutputType | null;
        _avg: RecipeIngredientAvgAggregateOutputType | null;
        _sum: RecipeIngredientSumAggregateOutputType | null;
        _min: RecipeIngredientMinAggregateOutputType | null;
        _max: RecipeIngredientMaxAggregateOutputType | null;
    };

    type GetRecipeIngredientGroupByPayload<
        T extends RecipeIngredientGroupByArgs
    > = Prisma.PrismaPromise<
        Array<
            PickEnumerable<RecipeIngredientGroupByOutputType, T['by']> & {
                [P in keyof T &
                    keyof RecipeIngredientGroupByOutputType]: P extends '_count'
                    ? T[P] extends boolean
                        ? number
                        : GetScalarType<
                              T[P],
                              RecipeIngredientGroupByOutputType[P]
                          >
                    : GetScalarType<T[P], RecipeIngredientGroupByOutputType[P]>;
            }
        >
    >;

    export type RecipeIngredientSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            recipeId?: boolean;
            ingredientId?: boolean;
            quantity?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['recipeIngredient']
    >;

    export type RecipeIngredientSelectScalar = {
        id?: boolean;
        recipeId?: boolean;
        ingredientId?: boolean;
        quantity?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type RecipeIngredientOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        | 'id'
        | 'recipeId'
        | 'ingredientId'
        | 'quantity'
        | 'createdAt'
        | 'updatedAt',
        ExtArgs['result']['recipeIngredient']
    >;

    export type $RecipeIngredientPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'RecipeIngredient';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                recipeId: number;
                ingredientId: number;
                quantity: string;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['recipeIngredient']
        >;
        composites: {};
    };

    type RecipeIngredientGetPayload<
        S extends boolean | null | undefined | RecipeIngredientDefaultArgs
    > = $Result.GetResult<Prisma.$RecipeIngredientPayload, S>;

    type RecipeIngredientCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<
        RecipeIngredientFindManyArgs,
        'select' | 'include' | 'distinct' | 'omit'
    > & {
        select?: RecipeIngredientCountAggregateInputType | true;
    };

    export interface RecipeIngredientDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['RecipeIngredient'];
            meta: { name: 'RecipeIngredient' };
        };
        /**
         * Find zero or one RecipeIngredient that matches the filter.
         * @param {RecipeIngredientFindUniqueArgs} args - Arguments to find a RecipeIngredient
         * @example
         * // Get one RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends RecipeIngredientFindUniqueArgs>(
            args: SelectSubset<T, RecipeIngredientFindUniqueArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one RecipeIngredient that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {RecipeIngredientFindUniqueOrThrowArgs} args - Arguments to find a RecipeIngredient
         * @example
         * // Get one RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends RecipeIngredientFindUniqueOrThrowArgs>(
            args: SelectSubset<
                T,
                RecipeIngredientFindUniqueOrThrowArgs<ExtArgs>
            >
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first RecipeIngredient that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientFindFirstArgs} args - Arguments to find a RecipeIngredient
         * @example
         * // Get one RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends RecipeIngredientFindFirstArgs>(
            args?: SelectSubset<T, RecipeIngredientFindFirstArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first RecipeIngredient that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientFindFirstOrThrowArgs} args - Arguments to find a RecipeIngredient
         * @example
         * // Get one RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends RecipeIngredientFindFirstOrThrowArgs>(
            args?: SelectSubset<
                T,
                RecipeIngredientFindFirstOrThrowArgs<ExtArgs>
            >
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more RecipeIngredients that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all RecipeIngredients
         * const recipeIngredients = await prisma.recipeIngredient.findMany()
         *
         * // Get first 10 RecipeIngredients
         * const recipeIngredients = await prisma.recipeIngredient.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const recipeIngredientWithIdOnly = await prisma.recipeIngredient.findMany({ select: { id: true } })
         *
         */
        findMany<T extends RecipeIngredientFindManyArgs>(
            args?: SelectSubset<T, RecipeIngredientFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a RecipeIngredient.
         * @param {RecipeIngredientCreateArgs} args - Arguments to create a RecipeIngredient.
         * @example
         * // Create one RecipeIngredient
         * const RecipeIngredient = await prisma.recipeIngredient.create({
         *   data: {
         *     // ... data to create a RecipeIngredient
         *   }
         * })
         *
         */
        create<T extends RecipeIngredientCreateArgs>(
            args: SelectSubset<T, RecipeIngredientCreateArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many RecipeIngredients.
         * @param {RecipeIngredientCreateManyArgs} args - Arguments to create many RecipeIngredients.
         * @example
         * // Create many RecipeIngredients
         * const recipeIngredient = await prisma.recipeIngredient.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends RecipeIngredientCreateManyArgs>(
            args?: SelectSubset<T, RecipeIngredientCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a RecipeIngredient.
         * @param {RecipeIngredientDeleteArgs} args - Arguments to delete one RecipeIngredient.
         * @example
         * // Delete one RecipeIngredient
         * const RecipeIngredient = await prisma.recipeIngredient.delete({
         *   where: {
         *     // ... filter to delete one RecipeIngredient
         *   }
         * })
         *
         */
        delete<T extends RecipeIngredientDeleteArgs>(
            args: SelectSubset<T, RecipeIngredientDeleteArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one RecipeIngredient.
         * @param {RecipeIngredientUpdateArgs} args - Arguments to update one RecipeIngredient.
         * @example
         * // Update one RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends RecipeIngredientUpdateArgs>(
            args: SelectSubset<T, RecipeIngredientUpdateArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more RecipeIngredients.
         * @param {RecipeIngredientDeleteManyArgs} args - Arguments to filter RecipeIngredients to delete.
         * @example
         * // Delete a few RecipeIngredients
         * const { count } = await prisma.recipeIngredient.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends RecipeIngredientDeleteManyArgs>(
            args?: SelectSubset<T, RecipeIngredientDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more RecipeIngredients.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many RecipeIngredients
         * const recipeIngredient = await prisma.recipeIngredient.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends RecipeIngredientUpdateManyArgs>(
            args: SelectSubset<T, RecipeIngredientUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one RecipeIngredient.
         * @param {RecipeIngredientUpsertArgs} args - Arguments to update or create a RecipeIngredient.
         * @example
         * // Update or create a RecipeIngredient
         * const recipeIngredient = await prisma.recipeIngredient.upsert({
         *   create: {
         *     // ... data to create a RecipeIngredient
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the RecipeIngredient we want to update
         *   }
         * })
         */
        upsert<T extends RecipeIngredientUpsertArgs>(
            args: SelectSubset<T, RecipeIngredientUpsertArgs<ExtArgs>>
        ): Prisma__RecipeIngredientClient<
            $Result.GetResult<
                Prisma.$RecipeIngredientPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of RecipeIngredients.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientCountArgs} args - Arguments to filter RecipeIngredients to count.
         * @example
         * // Count the number of RecipeIngredients
         * const count = await prisma.recipeIngredient.count({
         *   where: {
         *     // ... the filter for the RecipeIngredients we want to count
         *   }
         * })
         **/
        count<T extends RecipeIngredientCountArgs>(
            args?: Subset<T, RecipeIngredientCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<
                          T['select'],
                          RecipeIngredientCountAggregateOutputType
                      >
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a RecipeIngredient.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends RecipeIngredientAggregateArgs>(
            args: Subset<T, RecipeIngredientAggregateArgs>
        ): Prisma.PrismaPromise<GetRecipeIngredientAggregateType<T>>;

        /**
         * Group by RecipeIngredient.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RecipeIngredientGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends RecipeIngredientGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: RecipeIngredientGroupByArgs['orderBy'] }
                : { orderBy?: RecipeIngredientGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<
                T,
                RecipeIngredientGroupByArgs,
                OrderByArg
            > &
                InputErrors
        ): {} extends InputErrors
            ? GetRecipeIngredientGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the RecipeIngredient model
         */
        readonly fields: RecipeIngredientFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for RecipeIngredient.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__RecipeIngredientClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the RecipeIngredient model
     */
    interface RecipeIngredientFieldRefs {
        readonly id: FieldRef<'RecipeIngredient', 'Int'>;
        readonly recipeId: FieldRef<'RecipeIngredient', 'Int'>;
        readonly ingredientId: FieldRef<'RecipeIngredient', 'Int'>;
        readonly quantity: FieldRef<'RecipeIngredient', 'String'>;
        readonly createdAt: FieldRef<'RecipeIngredient', 'DateTime'>;
        readonly updatedAt: FieldRef<'RecipeIngredient', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * RecipeIngredient findUnique
     */
    export type RecipeIngredientFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter, which RecipeIngredient to fetch.
         */
        where: RecipeIngredientWhereUniqueInput;
    };

    /**
     * RecipeIngredient findUniqueOrThrow
     */
    export type RecipeIngredientFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter, which RecipeIngredient to fetch.
         */
        where: RecipeIngredientWhereUniqueInput;
    };

    /**
     * RecipeIngredient findFirst
     */
    export type RecipeIngredientFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter, which RecipeIngredient to fetch.
         */
        where?: RecipeIngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of RecipeIngredients to fetch.
         */
        orderBy?:
            | RecipeIngredientOrderByWithRelationInput
            | RecipeIngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for RecipeIngredients.
         */
        cursor?: RecipeIngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` RecipeIngredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` RecipeIngredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of RecipeIngredients.
         */
        distinct?:
            | RecipeIngredientScalarFieldEnum
            | RecipeIngredientScalarFieldEnum[];
    };

    /**
     * RecipeIngredient findFirstOrThrow
     */
    export type RecipeIngredientFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter, which RecipeIngredient to fetch.
         */
        where?: RecipeIngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of RecipeIngredients to fetch.
         */
        orderBy?:
            | RecipeIngredientOrderByWithRelationInput
            | RecipeIngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for RecipeIngredients.
         */
        cursor?: RecipeIngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` RecipeIngredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` RecipeIngredients.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of RecipeIngredients.
         */
        distinct?:
            | RecipeIngredientScalarFieldEnum
            | RecipeIngredientScalarFieldEnum[];
    };

    /**
     * RecipeIngredient findMany
     */
    export type RecipeIngredientFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter, which RecipeIngredients to fetch.
         */
        where?: RecipeIngredientWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of RecipeIngredients to fetch.
         */
        orderBy?:
            | RecipeIngredientOrderByWithRelationInput
            | RecipeIngredientOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing RecipeIngredients.
         */
        cursor?: RecipeIngredientWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` RecipeIngredients from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` RecipeIngredients.
         */
        skip?: number;
        distinct?:
            | RecipeIngredientScalarFieldEnum
            | RecipeIngredientScalarFieldEnum[];
    };

    /**
     * RecipeIngredient create
     */
    export type RecipeIngredientCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * The data needed to create a RecipeIngredient.
         */
        data: XOR<
            RecipeIngredientCreateInput,
            RecipeIngredientUncheckedCreateInput
        >;
    };

    /**
     * RecipeIngredient createMany
     */
    export type RecipeIngredientCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many RecipeIngredients.
         */
        data:
            | RecipeIngredientCreateManyInput
            | RecipeIngredientCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * RecipeIngredient update
     */
    export type RecipeIngredientUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * The data needed to update a RecipeIngredient.
         */
        data: XOR<
            RecipeIngredientUpdateInput,
            RecipeIngredientUncheckedUpdateInput
        >;
        /**
         * Choose, which RecipeIngredient to update.
         */
        where: RecipeIngredientWhereUniqueInput;
    };

    /**
     * RecipeIngredient updateMany
     */
    export type RecipeIngredientUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update RecipeIngredients.
         */
        data: XOR<
            RecipeIngredientUpdateManyMutationInput,
            RecipeIngredientUncheckedUpdateManyInput
        >;
        /**
         * Filter which RecipeIngredients to update
         */
        where?: RecipeIngredientWhereInput;
        /**
         * Limit how many RecipeIngredients to update.
         */
        limit?: number;
    };

    /**
     * RecipeIngredient upsert
     */
    export type RecipeIngredientUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * The filter to search for the RecipeIngredient to update in case it exists.
         */
        where: RecipeIngredientWhereUniqueInput;
        /**
         * In case the RecipeIngredient found by the `where` argument doesn't exist, create a new RecipeIngredient with this data.
         */
        create: XOR<
            RecipeIngredientCreateInput,
            RecipeIngredientUncheckedCreateInput
        >;
        /**
         * In case the RecipeIngredient was found with the provided `where` argument, update it with this data.
         */
        update: XOR<
            RecipeIngredientUpdateInput,
            RecipeIngredientUncheckedUpdateInput
        >;
    };

    /**
     * RecipeIngredient delete
     */
    export type RecipeIngredientDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
        /**
         * Filter which RecipeIngredient to delete.
         */
        where: RecipeIngredientWhereUniqueInput;
    };

    /**
     * RecipeIngredient deleteMany
     */
    export type RecipeIngredientDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which RecipeIngredients to delete
         */
        where?: RecipeIngredientWhereInput;
        /**
         * Limit how many RecipeIngredients to delete.
         */
        limit?: number;
    };

    /**
     * RecipeIngredient without action
     */
    export type RecipeIngredientDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the RecipeIngredient
         */
        select?: RecipeIngredientSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the RecipeIngredient
         */
        omit?: RecipeIngredientOmit<ExtArgs> | null;
    };

    /**
     * Model Rating
     */

    export type AggregateRating = {
        _count: RatingCountAggregateOutputType | null;
        _avg: RatingAvgAggregateOutputType | null;
        _sum: RatingSumAggregateOutputType | null;
        _min: RatingMinAggregateOutputType | null;
        _max: RatingMaxAggregateOutputType | null;
    };

    export type RatingAvgAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        userId: number | null;
        rating: number | null;
    };

    export type RatingSumAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        userId: number | null;
        rating: number | null;
    };

    export type RatingMinAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        userId: number | null;
        rating: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RatingMaxAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        userId: number | null;
        rating: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type RatingCountAggregateOutputType = {
        id: number;
        recipeId: number;
        userId: number;
        rating: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type RatingAvgAggregateInputType = {
        id?: true;
        recipeId?: true;
        userId?: true;
        rating?: true;
    };

    export type RatingSumAggregateInputType = {
        id?: true;
        recipeId?: true;
        userId?: true;
        rating?: true;
    };

    export type RatingMinAggregateInputType = {
        id?: true;
        recipeId?: true;
        userId?: true;
        rating?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RatingMaxAggregateInputType = {
        id?: true;
        recipeId?: true;
        userId?: true;
        rating?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type RatingCountAggregateInputType = {
        id?: true;
        recipeId?: true;
        userId?: true;
        rating?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type RatingAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Rating to aggregate.
         */
        where?: RatingWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ratings to fetch.
         */
        orderBy?:
            | RatingOrderByWithRelationInput
            | RatingOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: RatingWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ratings from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ratings.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Ratings
         **/
        _count?: true | RatingCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: RatingAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: RatingSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: RatingMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: RatingMaxAggregateInputType;
    };

    export type GetRatingAggregateType<T extends RatingAggregateArgs> = {
        [P in keyof T & keyof AggregateRating]: P extends '_count' | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateRating[P]>
            : GetScalarType<T[P], AggregateRating[P]>;
    };

    export type RatingGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: RatingWhereInput;
        orderBy?:
            | RatingOrderByWithAggregationInput
            | RatingOrderByWithAggregationInput[];
        by: RatingScalarFieldEnum[] | RatingScalarFieldEnum;
        having?: RatingScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: RatingCountAggregateInputType | true;
        _avg?: RatingAvgAggregateInputType;
        _sum?: RatingSumAggregateInputType;
        _min?: RatingMinAggregateInputType;
        _max?: RatingMaxAggregateInputType;
    };

    export type RatingGroupByOutputType = {
        id: number;
        recipeId: number;
        userId: number;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
        _count: RatingCountAggregateOutputType | null;
        _avg: RatingAvgAggregateOutputType | null;
        _sum: RatingSumAggregateOutputType | null;
        _min: RatingMinAggregateOutputType | null;
        _max: RatingMaxAggregateOutputType | null;
    };

    type GetRatingGroupByPayload<T extends RatingGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<RatingGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof RatingGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<T[P], RatingGroupByOutputType[P]>
                        : GetScalarType<T[P], RatingGroupByOutputType[P]>;
                }
            >
        >;

    export type RatingSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            recipeId?: boolean;
            userId?: boolean;
            rating?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['rating']
    >;

    export type RatingSelectScalar = {
        id?: boolean;
        recipeId?: boolean;
        userId?: boolean;
        rating?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type RatingOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        'id' | 'recipeId' | 'userId' | 'rating' | 'createdAt' | 'updatedAt',
        ExtArgs['result']['rating']
    >;

    export type $RatingPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'Rating';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                recipeId: number;
                userId: number;
                rating: number;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['rating']
        >;
        composites: {};
    };

    type RatingGetPayload<
        S extends boolean | null | undefined | RatingDefaultArgs
    > = $Result.GetResult<Prisma.$RatingPayload, S>;

    type RatingCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<RatingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
        select?: RatingCountAggregateInputType | true;
    };

    export interface RatingDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['Rating'];
            meta: { name: 'Rating' };
        };
        /**
         * Find zero or one Rating that matches the filter.
         * @param {RatingFindUniqueArgs} args - Arguments to find a Rating
         * @example
         * // Get one Rating
         * const rating = await prisma.rating.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends RatingFindUniqueArgs>(
            args: SelectSubset<T, RatingFindUniqueArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one Rating that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {RatingFindUniqueOrThrowArgs} args - Arguments to find a Rating
         * @example
         * // Get one Rating
         * const rating = await prisma.rating.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends RatingFindUniqueOrThrowArgs>(
            args: SelectSubset<T, RatingFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Rating that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingFindFirstArgs} args - Arguments to find a Rating
         * @example
         * // Get one Rating
         * const rating = await prisma.rating.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends RatingFindFirstArgs>(
            args?: SelectSubset<T, RatingFindFirstArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Rating that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingFindFirstOrThrowArgs} args - Arguments to find a Rating
         * @example
         * // Get one Rating
         * const rating = await prisma.rating.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends RatingFindFirstOrThrowArgs>(
            args?: SelectSubset<T, RatingFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Ratings that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Ratings
         * const ratings = await prisma.rating.findMany()
         *
         * // Get first 10 Ratings
         * const ratings = await prisma.rating.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const ratingWithIdOnly = await prisma.rating.findMany({ select: { id: true } })
         *
         */
        findMany<T extends RatingFindManyArgs>(
            args?: SelectSubset<T, RatingFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a Rating.
         * @param {RatingCreateArgs} args - Arguments to create a Rating.
         * @example
         * // Create one Rating
         * const Rating = await prisma.rating.create({
         *   data: {
         *     // ... data to create a Rating
         *   }
         * })
         *
         */
        create<T extends RatingCreateArgs>(
            args: SelectSubset<T, RatingCreateArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Ratings.
         * @param {RatingCreateManyArgs} args - Arguments to create many Ratings.
         * @example
         * // Create many Ratings
         * const rating = await prisma.rating.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends RatingCreateManyArgs>(
            args?: SelectSubset<T, RatingCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a Rating.
         * @param {RatingDeleteArgs} args - Arguments to delete one Rating.
         * @example
         * // Delete one Rating
         * const Rating = await prisma.rating.delete({
         *   where: {
         *     // ... filter to delete one Rating
         *   }
         * })
         *
         */
        delete<T extends RatingDeleteArgs>(
            args: SelectSubset<T, RatingDeleteArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one Rating.
         * @param {RatingUpdateArgs} args - Arguments to update one Rating.
         * @example
         * // Update one Rating
         * const rating = await prisma.rating.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends RatingUpdateArgs>(
            args: SelectSubset<T, RatingUpdateArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Ratings.
         * @param {RatingDeleteManyArgs} args - Arguments to filter Ratings to delete.
         * @example
         * // Delete a few Ratings
         * const { count } = await prisma.rating.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends RatingDeleteManyArgs>(
            args?: SelectSubset<T, RatingDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Ratings.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Ratings
         * const rating = await prisma.rating.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends RatingUpdateManyArgs>(
            args: SelectSubset<T, RatingUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one Rating.
         * @param {RatingUpsertArgs} args - Arguments to update or create a Rating.
         * @example
         * // Update or create a Rating
         * const rating = await prisma.rating.upsert({
         *   create: {
         *     // ... data to create a Rating
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the Rating we want to update
         *   }
         * })
         */
        upsert<T extends RatingUpsertArgs>(
            args: SelectSubset<T, RatingUpsertArgs<ExtArgs>>
        ): Prisma__RatingClient<
            $Result.GetResult<
                Prisma.$RatingPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Ratings.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingCountArgs} args - Arguments to filter Ratings to count.
         * @example
         * // Count the number of Ratings
         * const count = await prisma.rating.count({
         *   where: {
         *     // ... the filter for the Ratings we want to count
         *   }
         * })
         **/
        count<T extends RatingCountArgs>(
            args?: Subset<T, RatingCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<T['select'], RatingCountAggregateOutputType>
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a Rating.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends RatingAggregateArgs>(
            args: Subset<T, RatingAggregateArgs>
        ): Prisma.PrismaPromise<GetRatingAggregateType<T>>;

        /**
         * Group by Rating.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {RatingGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends RatingGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: RatingGroupByArgs['orderBy'] }
                : { orderBy?: RatingGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, RatingGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetRatingGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the Rating model
         */
        readonly fields: RatingFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for Rating.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__RatingClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the Rating model
     */
    interface RatingFieldRefs {
        readonly id: FieldRef<'Rating', 'Int'>;
        readonly recipeId: FieldRef<'Rating', 'Int'>;
        readonly userId: FieldRef<'Rating', 'Int'>;
        readonly rating: FieldRef<'Rating', 'Int'>;
        readonly createdAt: FieldRef<'Rating', 'DateTime'>;
        readonly updatedAt: FieldRef<'Rating', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * Rating findUnique
     */
    export type RatingFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter, which Rating to fetch.
         */
        where: RatingWhereUniqueInput;
    };

    /**
     * Rating findUniqueOrThrow
     */
    export type RatingFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter, which Rating to fetch.
         */
        where: RatingWhereUniqueInput;
    };

    /**
     * Rating findFirst
     */
    export type RatingFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter, which Rating to fetch.
         */
        where?: RatingWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ratings to fetch.
         */
        orderBy?:
            | RatingOrderByWithRelationInput
            | RatingOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Ratings.
         */
        cursor?: RatingWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ratings from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ratings.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Ratings.
         */
        distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[];
    };

    /**
     * Rating findFirstOrThrow
     */
    export type RatingFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter, which Rating to fetch.
         */
        where?: RatingWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ratings to fetch.
         */
        orderBy?:
            | RatingOrderByWithRelationInput
            | RatingOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Ratings.
         */
        cursor?: RatingWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ratings from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ratings.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Ratings.
         */
        distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[];
    };

    /**
     * Rating findMany
     */
    export type RatingFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter, which Ratings to fetch.
         */
        where?: RatingWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Ratings to fetch.
         */
        orderBy?:
            | RatingOrderByWithRelationInput
            | RatingOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Ratings.
         */
        cursor?: RatingWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Ratings from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Ratings.
         */
        skip?: number;
        distinct?: RatingScalarFieldEnum | RatingScalarFieldEnum[];
    };

    /**
     * Rating create
     */
    export type RatingCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * The data needed to create a Rating.
         */
        data: XOR<RatingCreateInput, RatingUncheckedCreateInput>;
    };

    /**
     * Rating createMany
     */
    export type RatingCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Ratings.
         */
        data: RatingCreateManyInput | RatingCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * Rating update
     */
    export type RatingUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * The data needed to update a Rating.
         */
        data: XOR<RatingUpdateInput, RatingUncheckedUpdateInput>;
        /**
         * Choose, which Rating to update.
         */
        where: RatingWhereUniqueInput;
    };

    /**
     * Rating updateMany
     */
    export type RatingUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Ratings.
         */
        data: XOR<
            RatingUpdateManyMutationInput,
            RatingUncheckedUpdateManyInput
        >;
        /**
         * Filter which Ratings to update
         */
        where?: RatingWhereInput;
        /**
         * Limit how many Ratings to update.
         */
        limit?: number;
    };

    /**
     * Rating upsert
     */
    export type RatingUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * The filter to search for the Rating to update in case it exists.
         */
        where: RatingWhereUniqueInput;
        /**
         * In case the Rating found by the `where` argument doesn't exist, create a new Rating with this data.
         */
        create: XOR<RatingCreateInput, RatingUncheckedCreateInput>;
        /**
         * In case the Rating was found with the provided `where` argument, update it with this data.
         */
        update: XOR<RatingUpdateInput, RatingUncheckedUpdateInput>;
    };

    /**
     * Rating delete
     */
    export type RatingDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
        /**
         * Filter which Rating to delete.
         */
        where: RatingWhereUniqueInput;
    };

    /**
     * Rating deleteMany
     */
    export type RatingDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Ratings to delete
         */
        where?: RatingWhereInput;
        /**
         * Limit how many Ratings to delete.
         */
        limit?: number;
    };

    /**
     * Rating without action
     */
    export type RatingDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Rating
         */
        select?: RatingSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Rating
         */
        omit?: RatingOmit<ExtArgs> | null;
    };

    /**
     * Model Instruction
     */

    export type AggregateInstruction = {
        _count: InstructionCountAggregateOutputType | null;
        _avg: InstructionAvgAggregateOutputType | null;
        _sum: InstructionSumAggregateOutputType | null;
        _min: InstructionMinAggregateOutputType | null;
        _max: InstructionMaxAggregateOutputType | null;
    };

    export type InstructionAvgAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        step: number | null;
    };

    export type InstructionSumAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        step: number | null;
    };

    export type InstructionMinAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        step: number | null;
        text: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type InstructionMaxAggregateOutputType = {
        id: number | null;
        recipeId: number | null;
        step: number | null;
        text: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    };

    export type InstructionCountAggregateOutputType = {
        id: number;
        recipeId: number;
        step: number;
        text: number;
        createdAt: number;
        updatedAt: number;
        _all: number;
    };

    export type InstructionAvgAggregateInputType = {
        id?: true;
        recipeId?: true;
        step?: true;
    };

    export type InstructionSumAggregateInputType = {
        id?: true;
        recipeId?: true;
        step?: true;
    };

    export type InstructionMinAggregateInputType = {
        id?: true;
        recipeId?: true;
        step?: true;
        text?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type InstructionMaxAggregateInputType = {
        id?: true;
        recipeId?: true;
        step?: true;
        text?: true;
        createdAt?: true;
        updatedAt?: true;
    };

    export type InstructionCountAggregateInputType = {
        id?: true;
        recipeId?: true;
        step?: true;
        text?: true;
        createdAt?: true;
        updatedAt?: true;
        _all?: true;
    };

    export type InstructionAggregateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Instruction to aggregate.
         */
        where?: InstructionWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Instructions to fetch.
         */
        orderBy?:
            | InstructionOrderByWithRelationInput
            | InstructionOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the start position
         */
        cursor?: InstructionWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Instructions from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Instructions.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Count returned Instructions
         **/
        _count?: true | InstructionCountAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to average
         **/
        _avg?: InstructionAvgAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to sum
         **/
        _sum?: InstructionSumAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the minimum value
         **/
        _min?: InstructionMinAggregateInputType;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
         *
         * Select which fields to find the maximum value
         **/
        _max?: InstructionMaxAggregateInputType;
    };

    export type GetInstructionAggregateType<
        T extends InstructionAggregateArgs
    > = {
        [P in keyof T & keyof AggregateInstruction]: P extends
            | '_count'
            | 'count'
            ? T[P] extends true
                ? number
                : GetScalarType<T[P], AggregateInstruction[P]>
            : GetScalarType<T[P], AggregateInstruction[P]>;
    };

    export type InstructionGroupByArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        where?: InstructionWhereInput;
        orderBy?:
            | InstructionOrderByWithAggregationInput
            | InstructionOrderByWithAggregationInput[];
        by: InstructionScalarFieldEnum[] | InstructionScalarFieldEnum;
        having?: InstructionScalarWhereWithAggregatesInput;
        take?: number;
        skip?: number;
        _count?: InstructionCountAggregateInputType | true;
        _avg?: InstructionAvgAggregateInputType;
        _sum?: InstructionSumAggregateInputType;
        _min?: InstructionMinAggregateInputType;
        _max?: InstructionMaxAggregateInputType;
    };

    export type InstructionGroupByOutputType = {
        id: number;
        recipeId: number;
        step: number;
        text: string;
        createdAt: Date;
        updatedAt: Date;
        _count: InstructionCountAggregateOutputType | null;
        _avg: InstructionAvgAggregateOutputType | null;
        _sum: InstructionSumAggregateOutputType | null;
        _min: InstructionMinAggregateOutputType | null;
        _max: InstructionMaxAggregateOutputType | null;
    };

    type GetInstructionGroupByPayload<T extends InstructionGroupByArgs> =
        Prisma.PrismaPromise<
            Array<
                PickEnumerable<InstructionGroupByOutputType, T['by']> & {
                    [P in keyof T &
                        keyof InstructionGroupByOutputType]: P extends '_count'
                        ? T[P] extends boolean
                            ? number
                            : GetScalarType<
                                  T[P],
                                  InstructionGroupByOutputType[P]
                              >
                        : GetScalarType<T[P], InstructionGroupByOutputType[P]>;
                }
            >
        >;

    export type InstructionSelect<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetSelect<
        {
            id?: boolean;
            recipeId?: boolean;
            step?: boolean;
            text?: boolean;
            createdAt?: boolean;
            updatedAt?: boolean;
        },
        ExtArgs['result']['instruction']
    >;

    export type InstructionSelectScalar = {
        id?: boolean;
        recipeId?: boolean;
        step?: boolean;
        text?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
    };

    export type InstructionOmit<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = $Extensions.GetOmit<
        'id' | 'recipeId' | 'step' | 'text' | 'createdAt' | 'updatedAt',
        ExtArgs['result']['instruction']
    >;

    export type $InstructionPayload<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        name: 'Instruction';
        objects: {};
        scalars: $Extensions.GetPayloadResult<
            {
                id: number;
                recipeId: number;
                step: number;
                text: string;
                createdAt: Date;
                updatedAt: Date;
            },
            ExtArgs['result']['instruction']
        >;
        composites: {};
    };

    type InstructionGetPayload<
        S extends boolean | null | undefined | InstructionDefaultArgs
    > = $Result.GetResult<Prisma.$InstructionPayload, S>;

    type InstructionCountArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = Omit<
        InstructionFindManyArgs,
        'select' | 'include' | 'distinct' | 'omit'
    > & {
        select?: InstructionCountAggregateInputType | true;
    };

    export interface InstructionDelegate<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > {
        [K: symbol]: {
            types: Prisma.TypeMap<ExtArgs>['model']['Instruction'];
            meta: { name: 'Instruction' };
        };
        /**
         * Find zero or one Instruction that matches the filter.
         * @param {InstructionFindUniqueArgs} args - Arguments to find a Instruction
         * @example
         * // Get one Instruction
         * const instruction = await prisma.instruction.findUnique({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUnique<T extends InstructionFindUniqueArgs>(
            args: SelectSubset<T, InstructionFindUniqueArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'findUnique',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find one Instruction that matches the filter or throw an error with `error.code='P2025'`
         * if no matches were found.
         * @param {InstructionFindUniqueOrThrowArgs} args - Arguments to find a Instruction
         * @example
         * // Get one Instruction
         * const instruction = await prisma.instruction.findUniqueOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findUniqueOrThrow<T extends InstructionFindUniqueOrThrowArgs>(
            args: SelectSubset<T, InstructionFindUniqueOrThrowArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'findUniqueOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Instruction that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionFindFirstArgs} args - Arguments to find a Instruction
         * @example
         * // Get one Instruction
         * const instruction = await prisma.instruction.findFirst({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirst<T extends InstructionFindFirstArgs>(
            args?: SelectSubset<T, InstructionFindFirstArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'findFirst',
                GlobalOmitOptions
            > | null,
            null,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find the first Instruction that matches the filter or
         * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionFindFirstOrThrowArgs} args - Arguments to find a Instruction
         * @example
         * // Get one Instruction
         * const instruction = await prisma.instruction.findFirstOrThrow({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         */
        findFirstOrThrow<T extends InstructionFindFirstOrThrowArgs>(
            args?: SelectSubset<T, InstructionFindFirstOrThrowArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'findFirstOrThrow',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Find zero or more Instructions that matches the filter.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionFindManyArgs} args - Arguments to filter and select certain fields only.
         * @example
         * // Get all Instructions
         * const instructions = await prisma.instruction.findMany()
         *
         * // Get first 10 Instructions
         * const instructions = await prisma.instruction.findMany({ take: 10 })
         *
         * // Only select the `id`
         * const instructionWithIdOnly = await prisma.instruction.findMany({ select: { id: true } })
         *
         */
        findMany<T extends InstructionFindManyArgs>(
            args?: SelectSubset<T, InstructionFindManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'findMany',
                GlobalOmitOptions
            >
        >;

        /**
         * Create a Instruction.
         * @param {InstructionCreateArgs} args - Arguments to create a Instruction.
         * @example
         * // Create one Instruction
         * const Instruction = await prisma.instruction.create({
         *   data: {
         *     // ... data to create a Instruction
         *   }
         * })
         *
         */
        create<T extends InstructionCreateArgs>(
            args: SelectSubset<T, InstructionCreateArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'create',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Create many Instructions.
         * @param {InstructionCreateManyArgs} args - Arguments to create many Instructions.
         * @example
         * // Create many Instructions
         * const instruction = await prisma.instruction.createMany({
         *   data: [
         *     // ... provide data here
         *   ]
         * })
         *
         */
        createMany<T extends InstructionCreateManyArgs>(
            args?: SelectSubset<T, InstructionCreateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Delete a Instruction.
         * @param {InstructionDeleteArgs} args - Arguments to delete one Instruction.
         * @example
         * // Delete one Instruction
         * const Instruction = await prisma.instruction.delete({
         *   where: {
         *     // ... filter to delete one Instruction
         *   }
         * })
         *
         */
        delete<T extends InstructionDeleteArgs>(
            args: SelectSubset<T, InstructionDeleteArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'delete',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Update one Instruction.
         * @param {InstructionUpdateArgs} args - Arguments to update one Instruction.
         * @example
         * // Update one Instruction
         * const instruction = await prisma.instruction.update({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        update<T extends InstructionUpdateArgs>(
            args: SelectSubset<T, InstructionUpdateArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'update',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Delete zero or more Instructions.
         * @param {InstructionDeleteManyArgs} args - Arguments to filter Instructions to delete.
         * @example
         * // Delete a few Instructions
         * const { count } = await prisma.instruction.deleteMany({
         *   where: {
         *     // ... provide filter here
         *   }
         * })
         *
         */
        deleteMany<T extends InstructionDeleteManyArgs>(
            args?: SelectSubset<T, InstructionDeleteManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Update zero or more Instructions.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionUpdateManyArgs} args - Arguments to update one or more rows.
         * @example
         * // Update many Instructions
         * const instruction = await prisma.instruction.updateMany({
         *   where: {
         *     // ... provide filter here
         *   },
         *   data: {
         *     // ... provide data here
         *   }
         * })
         *
         */
        updateMany<T extends InstructionUpdateManyArgs>(
            args: SelectSubset<T, InstructionUpdateManyArgs<ExtArgs>>
        ): Prisma.PrismaPromise<BatchPayload>;

        /**
         * Create or update one Instruction.
         * @param {InstructionUpsertArgs} args - Arguments to update or create a Instruction.
         * @example
         * // Update or create a Instruction
         * const instruction = await prisma.instruction.upsert({
         *   create: {
         *     // ... data to create a Instruction
         *   },
         *   update: {
         *     // ... in case it already exists, update
         *   },
         *   where: {
         *     // ... the filter for the Instruction we want to update
         *   }
         * })
         */
        upsert<T extends InstructionUpsertArgs>(
            args: SelectSubset<T, InstructionUpsertArgs<ExtArgs>>
        ): Prisma__InstructionClient<
            $Result.GetResult<
                Prisma.$InstructionPayload<ExtArgs>,
                T,
                'upsert',
                GlobalOmitOptions
            >,
            never,
            ExtArgs,
            GlobalOmitOptions
        >;

        /**
         * Count the number of Instructions.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionCountArgs} args - Arguments to filter Instructions to count.
         * @example
         * // Count the number of Instructions
         * const count = await prisma.instruction.count({
         *   where: {
         *     // ... the filter for the Instructions we want to count
         *   }
         * })
         **/
        count<T extends InstructionCountArgs>(
            args?: Subset<T, InstructionCountArgs>
        ): Prisma.PrismaPromise<
            T extends $Utils.Record<'select', any>
                ? T['select'] extends true
                    ? number
                    : GetScalarType<
                          T['select'],
                          InstructionCountAggregateOutputType
                      >
                : number
        >;

        /**
         * Allows you to perform aggregations operations on a Instruction.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
         * @example
         * // Ordered by age ascending
         * // Where email contains prisma.io
         * // Limited to the 10 users
         * const aggregations = await prisma.user.aggregate({
         *   _avg: {
         *     age: true,
         *   },
         *   where: {
         *     email: {
         *       contains: "prisma.io",
         *     },
         *   },
         *   orderBy: {
         *     age: "asc",
         *   },
         *   take: 10,
         * })
         **/
        aggregate<T extends InstructionAggregateArgs>(
            args: Subset<T, InstructionAggregateArgs>
        ): Prisma.PrismaPromise<GetInstructionAggregateType<T>>;

        /**
         * Group by Instruction.
         * Note, that providing `undefined` is treated as the value not being there.
         * Read more here: https://pris.ly/d/null-undefined
         * @param {InstructionGroupByArgs} args - Group by arguments.
         * @example
         * // Group by city, order by createdAt, get count
         * const result = await prisma.user.groupBy({
         *   by: ['city', 'createdAt'],
         *   orderBy: {
         *     createdAt: true
         *   },
         *   _count: {
         *     _all: true
         *   },
         * })
         *
         **/
        groupBy<
            T extends InstructionGroupByArgs,
            HasSelectOrTake extends Or<
                Extends<'skip', Keys<T>>,
                Extends<'take', Keys<T>>
            >,
            OrderByArg extends True extends HasSelectOrTake
                ? { orderBy: InstructionGroupByArgs['orderBy'] }
                : { orderBy?: InstructionGroupByArgs['orderBy'] },
            OrderFields extends ExcludeUnderscoreKeys<
                Keys<MaybeTupleToUnion<T['orderBy']>>
            >,
            ByFields extends MaybeTupleToUnion<T['by']>,
            ByValid extends Has<ByFields, OrderFields>,
            HavingFields extends GetHavingFields<T['having']>,
            HavingValid extends Has<ByFields, HavingFields>,
            ByEmpty extends T['by'] extends never[] ? True : False,
            InputErrors extends ByEmpty extends True
                ? `Error: "by" must not be empty.`
                : HavingValid extends False
                  ? {
                        [P in HavingFields]: P extends ByFields
                            ? never
                            : P extends string
                              ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                              : [
                                    Error,
                                    'Field ',
                                    P,
                                    ` in "having" needs to be provided in "by"`
                                ];
                    }[HavingFields]
                  : 'take' extends Keys<T>
                    ? 'orderBy' extends Keys<T>
                        ? ByValid extends True
                            ? {}
                            : {
                                  [P in OrderFields]: P extends ByFields
                                      ? never
                                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                              }[OrderFields]
                        : 'Error: If you provide "take", you also need to provide "orderBy"'
                    : 'skip' extends Keys<T>
                      ? 'orderBy' extends Keys<T>
                          ? ByValid extends True
                              ? {}
                              : {
                                    [P in OrderFields]: P extends ByFields
                                        ? never
                                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                                }[OrderFields]
                          : 'Error: If you provide "skip", you also need to provide "orderBy"'
                      : ByValid extends True
                        ? {}
                        : {
                              [P in OrderFields]: P extends ByFields
                                  ? never
                                  : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                          }[OrderFields]
        >(
            args: SubsetIntersection<T, InstructionGroupByArgs, OrderByArg> &
                InputErrors
        ): {} extends InputErrors
            ? GetInstructionGroupByPayload<T>
            : Prisma.PrismaPromise<InputErrors>;
        /**
         * Fields of the Instruction model
         */
        readonly fields: InstructionFieldRefs;
    }

    /**
     * The delegate class that acts as a "Promise-like" for Instruction.
     * Why is this prefixed with `Prisma__`?
     * Because we want to prevent naming conflicts as mentioned in
     * https://github.com/prisma/prisma-client-js/issues/707
     */
    export interface Prisma__InstructionClient<
        T,
        Null = never,
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
        GlobalOmitOptions = {}
    > extends Prisma.PrismaPromise<T> {
        readonly [Symbol.toStringTag]: 'PrismaPromise';
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?:
                | ((value: T) => TResult1 | PromiseLike<TResult1>)
                | undefined
                | null,
            onrejected?:
                | ((reason: any) => TResult2 | PromiseLike<TResult2>)
                | undefined
                | null
        ): $Utils.JsPromise<TResult1 | TResult2>;
        /**
         * Attaches a callback for only the rejection of the Promise.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of the callback.
         */
        catch<TResult = never>(
            onrejected?:
                | ((reason: any) => TResult | PromiseLike<TResult>)
                | undefined
                | null
        ): $Utils.JsPromise<T | TResult>;
        /**
         * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
         * resolved value cannot be modified from the callback.
         * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
         * @returns A Promise for the completion of the callback.
         */
        finally(
            onfinally?: (() => void) | undefined | null
        ): $Utils.JsPromise<T>;
    }

    /**
     * Fields of the Instruction model
     */
    interface InstructionFieldRefs {
        readonly id: FieldRef<'Instruction', 'Int'>;
        readonly recipeId: FieldRef<'Instruction', 'Int'>;
        readonly step: FieldRef<'Instruction', 'Int'>;
        readonly text: FieldRef<'Instruction', 'String'>;
        readonly createdAt: FieldRef<'Instruction', 'DateTime'>;
        readonly updatedAt: FieldRef<'Instruction', 'DateTime'>;
    }

    // Custom InputTypes
    /**
     * Instruction findUnique
     */
    export type InstructionFindUniqueArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter, which Instruction to fetch.
         */
        where: InstructionWhereUniqueInput;
    };

    /**
     * Instruction findUniqueOrThrow
     */
    export type InstructionFindUniqueOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter, which Instruction to fetch.
         */
        where: InstructionWhereUniqueInput;
    };

    /**
     * Instruction findFirst
     */
    export type InstructionFindFirstArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter, which Instruction to fetch.
         */
        where?: InstructionWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Instructions to fetch.
         */
        orderBy?:
            | InstructionOrderByWithRelationInput
            | InstructionOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Instructions.
         */
        cursor?: InstructionWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Instructions from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Instructions.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Instructions.
         */
        distinct?: InstructionScalarFieldEnum | InstructionScalarFieldEnum[];
    };

    /**
     * Instruction findFirstOrThrow
     */
    export type InstructionFindFirstOrThrowArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter, which Instruction to fetch.
         */
        where?: InstructionWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Instructions to fetch.
         */
        orderBy?:
            | InstructionOrderByWithRelationInput
            | InstructionOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for searching for Instructions.
         */
        cursor?: InstructionWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Instructions from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Instructions.
         */
        skip?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
         *
         * Filter by unique combinations of Instructions.
         */
        distinct?: InstructionScalarFieldEnum | InstructionScalarFieldEnum[];
    };

    /**
     * Instruction findMany
     */
    export type InstructionFindManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter, which Instructions to fetch.
         */
        where?: InstructionWhereInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
         *
         * Determine the order of Instructions to fetch.
         */
        orderBy?:
            | InstructionOrderByWithRelationInput
            | InstructionOrderByWithRelationInput[];
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
         *
         * Sets the position for listing Instructions.
         */
        cursor?: InstructionWhereUniqueInput;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Take `±n` Instructions from the position of the cursor.
         */
        take?: number;
        /**
         * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
         *
         * Skip the first `n` Instructions.
         */
        skip?: number;
        distinct?: InstructionScalarFieldEnum | InstructionScalarFieldEnum[];
    };

    /**
     * Instruction create
     */
    export type InstructionCreateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * The data needed to create a Instruction.
         */
        data: XOR<InstructionCreateInput, InstructionUncheckedCreateInput>;
    };

    /**
     * Instruction createMany
     */
    export type InstructionCreateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to create many Instructions.
         */
        data: InstructionCreateManyInput | InstructionCreateManyInput[];
        skipDuplicates?: boolean;
    };

    /**
     * Instruction update
     */
    export type InstructionUpdateArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * The data needed to update a Instruction.
         */
        data: XOR<InstructionUpdateInput, InstructionUncheckedUpdateInput>;
        /**
         * Choose, which Instruction to update.
         */
        where: InstructionWhereUniqueInput;
    };

    /**
     * Instruction updateMany
     */
    export type InstructionUpdateManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * The data used to update Instructions.
         */
        data: XOR<
            InstructionUpdateManyMutationInput,
            InstructionUncheckedUpdateManyInput
        >;
        /**
         * Filter which Instructions to update
         */
        where?: InstructionWhereInput;
        /**
         * Limit how many Instructions to update.
         */
        limit?: number;
    };

    /**
     * Instruction upsert
     */
    export type InstructionUpsertArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * The filter to search for the Instruction to update in case it exists.
         */
        where: InstructionWhereUniqueInput;
        /**
         * In case the Instruction found by the `where` argument doesn't exist, create a new Instruction with this data.
         */
        create: XOR<InstructionCreateInput, InstructionUncheckedCreateInput>;
        /**
         * In case the Instruction was found with the provided `where` argument, update it with this data.
         */
        update: XOR<InstructionUpdateInput, InstructionUncheckedUpdateInput>;
    };

    /**
     * Instruction delete
     */
    export type InstructionDeleteArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
        /**
         * Filter which Instruction to delete.
         */
        where: InstructionWhereUniqueInput;
    };

    /**
     * Instruction deleteMany
     */
    export type InstructionDeleteManyArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Filter which Instructions to delete
         */
        where?: InstructionWhereInput;
        /**
         * Limit how many Instructions to delete.
         */
        limit?: number;
    };

    /**
     * Instruction without action
     */
    export type InstructionDefaultArgs<
        ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
    > = {
        /**
         * Select specific fields to fetch from the Instruction
         */
        select?: InstructionSelect<ExtArgs> | null;
        /**
         * Omit specific fields from the Instruction
         */
        omit?: InstructionOmit<ExtArgs> | null;
    };

    /**
     * Enums
     */

    export const TransactionIsolationLevel: {
        ReadUncommitted: 'ReadUncommitted';
        ReadCommitted: 'ReadCommitted';
        RepeatableRead: 'RepeatableRead';
        Serializable: 'Serializable';
    };

    export type TransactionIsolationLevel =
        (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

    export const UserScalarFieldEnum: {
        id: 'id';
        username: 'username';
        email: 'email';
        passwordHash: 'passwordHash';
        authType: 'authType';
        role: 'role';
        status: 'status';
        avatarUrl: 'avatarUrl';
        emailVerified: 'emailVerified';
        emailVerificationToken: 'emailVerificationToken';
        passwordResetToken: 'passwordResetToken';
        passwordResetTokenExpires: 'passwordResetTokenExpires';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
        lastLogin: 'lastLogin';
        lastPasswordReset: 'lastPasswordReset';
    };

    export type UserScalarFieldEnum =
        (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

    export const RecipeScalarFieldEnum: {
        id: 'id';
        title: 'title';
        description: 'description';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type RecipeScalarFieldEnum =
        (typeof RecipeScalarFieldEnum)[keyof typeof RecipeScalarFieldEnum];

    export const IngredientScalarFieldEnum: {
        id: 'id';
        name: 'name';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type IngredientScalarFieldEnum =
        (typeof IngredientScalarFieldEnum)[keyof typeof IngredientScalarFieldEnum];

    export const UnitScalarFieldEnum: {
        id: 'id';
        name: 'name';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type UnitScalarFieldEnum =
        (typeof UnitScalarFieldEnum)[keyof typeof UnitScalarFieldEnum];

    export const RecipeIngredientScalarFieldEnum: {
        id: 'id';
        recipeId: 'recipeId';
        ingredientId: 'ingredientId';
        quantity: 'quantity';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type RecipeIngredientScalarFieldEnum =
        (typeof RecipeIngredientScalarFieldEnum)[keyof typeof RecipeIngredientScalarFieldEnum];

    export const RatingScalarFieldEnum: {
        id: 'id';
        recipeId: 'recipeId';
        userId: 'userId';
        rating: 'rating';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type RatingScalarFieldEnum =
        (typeof RatingScalarFieldEnum)[keyof typeof RatingScalarFieldEnum];

    export const InstructionScalarFieldEnum: {
        id: 'id';
        recipeId: 'recipeId';
        step: 'step';
        text: 'text';
        createdAt: 'createdAt';
        updatedAt: 'updatedAt';
    };

    export type InstructionScalarFieldEnum =
        (typeof InstructionScalarFieldEnum)[keyof typeof InstructionScalarFieldEnum];

    export const SortOrder: {
        asc: 'asc';
        desc: 'desc';
    };

    export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

    export const NullsOrder: {
        first: 'first';
        last: 'last';
    };

    export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

    export const UserOrderByRelevanceFieldEnum: {
        username: 'username';
        email: 'email';
        passwordHash: 'passwordHash';
        authType: 'authType';
        role: 'role';
        status: 'status';
        avatarUrl: 'avatarUrl';
        emailVerificationToken: 'emailVerificationToken';
        passwordResetToken: 'passwordResetToken';
    };

    export type UserOrderByRelevanceFieldEnum =
        (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum];

    export const RecipeOrderByRelevanceFieldEnum: {
        title: 'title';
        description: 'description';
    };

    export type RecipeOrderByRelevanceFieldEnum =
        (typeof RecipeOrderByRelevanceFieldEnum)[keyof typeof RecipeOrderByRelevanceFieldEnum];

    export const IngredientOrderByRelevanceFieldEnum: {
        name: 'name';
    };

    export type IngredientOrderByRelevanceFieldEnum =
        (typeof IngredientOrderByRelevanceFieldEnum)[keyof typeof IngredientOrderByRelevanceFieldEnum];

    export const UnitOrderByRelevanceFieldEnum: {
        name: 'name';
    };

    export type UnitOrderByRelevanceFieldEnum =
        (typeof UnitOrderByRelevanceFieldEnum)[keyof typeof UnitOrderByRelevanceFieldEnum];

    export const RecipeIngredientOrderByRelevanceFieldEnum: {
        quantity: 'quantity';
    };

    export type RecipeIngredientOrderByRelevanceFieldEnum =
        (typeof RecipeIngredientOrderByRelevanceFieldEnum)[keyof typeof RecipeIngredientOrderByRelevanceFieldEnum];

    export const InstructionOrderByRelevanceFieldEnum: {
        text: 'text';
    };

    export type InstructionOrderByRelevanceFieldEnum =
        (typeof InstructionOrderByRelevanceFieldEnum)[keyof typeof InstructionOrderByRelevanceFieldEnum];

    /**
     * Field references
     */

    /**
     * Reference to a field of type 'Int'
     */
    export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
        $PrismaModel,
        'Int'
    >;

    /**
     * Reference to a field of type 'String'
     */
    export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
        $PrismaModel,
        'String'
    >;

    /**
     * Reference to a field of type 'Boolean'
     */
    export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
        $PrismaModel,
        'Boolean'
    >;

    /**
     * Reference to a field of type 'DateTime'
     */
    export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
        $PrismaModel,
        'DateTime'
    >;

    /**
     * Reference to a field of type 'Float'
     */
    export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
        $PrismaModel,
        'Float'
    >;

    /**
     * Deep Input Types
     */

    export type UserWhereInput = {
        AND?: UserWhereInput | UserWhereInput[];
        OR?: UserWhereInput[];
        NOT?: UserWhereInput | UserWhereInput[];
        id?: IntFilter<'User'> | number;
        username?: StringFilter<'User'> | string;
        email?: StringFilter<'User'> | string;
        passwordHash?: StringNullableFilter<'User'> | string | null;
        authType?: StringFilter<'User'> | string;
        role?: StringFilter<'User'> | string;
        status?: StringFilter<'User'> | string;
        avatarUrl?: StringNullableFilter<'User'> | string | null;
        emailVerified?: BoolFilter<'User'> | boolean;
        emailVerificationToken?: StringNullableFilter<'User'> | string | null;
        passwordResetToken?: StringNullableFilter<'User'> | string | null;
        passwordResetTokenExpires?:
            | DateTimeNullableFilter<'User'>
            | Date
            | string
            | null;
        createdAt?: DateTimeFilter<'User'> | Date | string;
        updatedAt?: DateTimeFilter<'User'> | Date | string;
        lastLogin?: DateTimeNullableFilter<'User'> | Date | string | null;
        lastPasswordReset?:
            | DateTimeNullableFilter<'User'>
            | Date
            | string
            | null;
    };

    export type UserOrderByWithRelationInput = {
        id?: SortOrder;
        username?: SortOrder;
        email?: SortOrder;
        passwordHash?: SortOrderInput | SortOrder;
        authType?: SortOrder;
        role?: SortOrder;
        status?: SortOrder;
        avatarUrl?: SortOrderInput | SortOrder;
        emailVerified?: SortOrder;
        emailVerificationToken?: SortOrderInput | SortOrder;
        passwordResetToken?: SortOrderInput | SortOrder;
        passwordResetTokenExpires?: SortOrderInput | SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        lastLogin?: SortOrderInput | SortOrder;
        lastPasswordReset?: SortOrderInput | SortOrder;
        _relevance?: UserOrderByRelevanceInput;
    };

    export type UserWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            username?: string;
            email?: string;
            AND?: UserWhereInput | UserWhereInput[];
            OR?: UserWhereInput[];
            NOT?: UserWhereInput | UserWhereInput[];
            passwordHash?: StringNullableFilter<'User'> | string | null;
            authType?: StringFilter<'User'> | string;
            role?: StringFilter<'User'> | string;
            status?: StringFilter<'User'> | string;
            avatarUrl?: StringNullableFilter<'User'> | string | null;
            emailVerified?: BoolFilter<'User'> | boolean;
            emailVerificationToken?:
                | StringNullableFilter<'User'>
                | string
                | null;
            passwordResetToken?: StringNullableFilter<'User'> | string | null;
            passwordResetTokenExpires?:
                | DateTimeNullableFilter<'User'>
                | Date
                | string
                | null;
            createdAt?: DateTimeFilter<'User'> | Date | string;
            updatedAt?: DateTimeFilter<'User'> | Date | string;
            lastLogin?: DateTimeNullableFilter<'User'> | Date | string | null;
            lastPasswordReset?:
                | DateTimeNullableFilter<'User'>
                | Date
                | string
                | null;
        },
        'id' | 'username' | 'email'
    >;

    export type UserOrderByWithAggregationInput = {
        id?: SortOrder;
        username?: SortOrder;
        email?: SortOrder;
        passwordHash?: SortOrderInput | SortOrder;
        authType?: SortOrder;
        role?: SortOrder;
        status?: SortOrder;
        avatarUrl?: SortOrderInput | SortOrder;
        emailVerified?: SortOrder;
        emailVerificationToken?: SortOrderInput | SortOrder;
        passwordResetToken?: SortOrderInput | SortOrder;
        passwordResetTokenExpires?: SortOrderInput | SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        lastLogin?: SortOrderInput | SortOrder;
        lastPasswordReset?: SortOrderInput | SortOrder;
        _count?: UserCountOrderByAggregateInput;
        _avg?: UserAvgOrderByAggregateInput;
        _max?: UserMaxOrderByAggregateInput;
        _min?: UserMinOrderByAggregateInput;
        _sum?: UserSumOrderByAggregateInput;
    };

    export type UserScalarWhereWithAggregatesInput = {
        AND?:
            | UserScalarWhereWithAggregatesInput
            | UserScalarWhereWithAggregatesInput[];
        OR?: UserScalarWhereWithAggregatesInput[];
        NOT?:
            | UserScalarWhereWithAggregatesInput
            | UserScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'User'> | number;
        username?: StringWithAggregatesFilter<'User'> | string;
        email?: StringWithAggregatesFilter<'User'> | string;
        passwordHash?:
            | StringNullableWithAggregatesFilter<'User'>
            | string
            | null;
        authType?: StringWithAggregatesFilter<'User'> | string;
        role?: StringWithAggregatesFilter<'User'> | string;
        status?: StringWithAggregatesFilter<'User'> | string;
        avatarUrl?: StringNullableWithAggregatesFilter<'User'> | string | null;
        emailVerified?: BoolWithAggregatesFilter<'User'> | boolean;
        emailVerificationToken?:
            | StringNullableWithAggregatesFilter<'User'>
            | string
            | null;
        passwordResetToken?:
            | StringNullableWithAggregatesFilter<'User'>
            | string
            | null;
        passwordResetTokenExpires?:
            | DateTimeNullableWithAggregatesFilter<'User'>
            | Date
            | string
            | null;
        createdAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'User'> | Date | string;
        lastLogin?:
            | DateTimeNullableWithAggregatesFilter<'User'>
            | Date
            | string
            | null;
        lastPasswordReset?:
            | DateTimeNullableWithAggregatesFilter<'User'>
            | Date
            | string
            | null;
    };

    export type RecipeWhereInput = {
        AND?: RecipeWhereInput | RecipeWhereInput[];
        OR?: RecipeWhereInput[];
        NOT?: RecipeWhereInput | RecipeWhereInput[];
        id?: IntFilter<'Recipe'> | number;
        title?: StringFilter<'Recipe'> | string;
        description?: StringFilter<'Recipe'> | string;
        createdAt?: DateTimeFilter<'Recipe'> | Date | string;
        updatedAt?: DateTimeFilter<'Recipe'> | Date | string;
    };

    export type RecipeOrderByWithRelationInput = {
        id?: SortOrder;
        title?: SortOrder;
        description?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _relevance?: RecipeOrderByRelevanceInput;
    };

    export type RecipeWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: RecipeWhereInput | RecipeWhereInput[];
            OR?: RecipeWhereInput[];
            NOT?: RecipeWhereInput | RecipeWhereInput[];
            title?: StringFilter<'Recipe'> | string;
            description?: StringFilter<'Recipe'> | string;
            createdAt?: DateTimeFilter<'Recipe'> | Date | string;
            updatedAt?: DateTimeFilter<'Recipe'> | Date | string;
        },
        'id'
    >;

    export type RecipeOrderByWithAggregationInput = {
        id?: SortOrder;
        title?: SortOrder;
        description?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: RecipeCountOrderByAggregateInput;
        _avg?: RecipeAvgOrderByAggregateInput;
        _max?: RecipeMaxOrderByAggregateInput;
        _min?: RecipeMinOrderByAggregateInput;
        _sum?: RecipeSumOrderByAggregateInput;
    };

    export type RecipeScalarWhereWithAggregatesInput = {
        AND?:
            | RecipeScalarWhereWithAggregatesInput
            | RecipeScalarWhereWithAggregatesInput[];
        OR?: RecipeScalarWhereWithAggregatesInput[];
        NOT?:
            | RecipeScalarWhereWithAggregatesInput
            | RecipeScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'Recipe'> | number;
        title?: StringWithAggregatesFilter<'Recipe'> | string;
        description?: StringWithAggregatesFilter<'Recipe'> | string;
        createdAt?: DateTimeWithAggregatesFilter<'Recipe'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'Recipe'> | Date | string;
    };

    export type IngredientWhereInput = {
        AND?: IngredientWhereInput | IngredientWhereInput[];
        OR?: IngredientWhereInput[];
        NOT?: IngredientWhereInput | IngredientWhereInput[];
        id?: IntFilter<'Ingredient'> | number;
        name?: StringFilter<'Ingredient'> | string;
        createdAt?: DateTimeFilter<'Ingredient'> | Date | string;
        updatedAt?: DateTimeFilter<'Ingredient'> | Date | string;
    };

    export type IngredientOrderByWithRelationInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _relevance?: IngredientOrderByRelevanceInput;
    };

    export type IngredientWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: IngredientWhereInput | IngredientWhereInput[];
            OR?: IngredientWhereInput[];
            NOT?: IngredientWhereInput | IngredientWhereInput[];
            name?: StringFilter<'Ingredient'> | string;
            createdAt?: DateTimeFilter<'Ingredient'> | Date | string;
            updatedAt?: DateTimeFilter<'Ingredient'> | Date | string;
        },
        'id'
    >;

    export type IngredientOrderByWithAggregationInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: IngredientCountOrderByAggregateInput;
        _avg?: IngredientAvgOrderByAggregateInput;
        _max?: IngredientMaxOrderByAggregateInput;
        _min?: IngredientMinOrderByAggregateInput;
        _sum?: IngredientSumOrderByAggregateInput;
    };

    export type IngredientScalarWhereWithAggregatesInput = {
        AND?:
            | IngredientScalarWhereWithAggregatesInput
            | IngredientScalarWhereWithAggregatesInput[];
        OR?: IngredientScalarWhereWithAggregatesInput[];
        NOT?:
            | IngredientScalarWhereWithAggregatesInput
            | IngredientScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'Ingredient'> | number;
        name?: StringWithAggregatesFilter<'Ingredient'> | string;
        createdAt?: DateTimeWithAggregatesFilter<'Ingredient'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'Ingredient'> | Date | string;
    };

    export type UnitWhereInput = {
        AND?: UnitWhereInput | UnitWhereInput[];
        OR?: UnitWhereInput[];
        NOT?: UnitWhereInput | UnitWhereInput[];
        id?: IntFilter<'Unit'> | number;
        name?: StringFilter<'Unit'> | string;
        createdAt?: DateTimeFilter<'Unit'> | Date | string;
        updatedAt?: DateTimeFilter<'Unit'> | Date | string;
    };

    export type UnitOrderByWithRelationInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _relevance?: UnitOrderByRelevanceInput;
    };

    export type UnitWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: UnitWhereInput | UnitWhereInput[];
            OR?: UnitWhereInput[];
            NOT?: UnitWhereInput | UnitWhereInput[];
            name?: StringFilter<'Unit'> | string;
            createdAt?: DateTimeFilter<'Unit'> | Date | string;
            updatedAt?: DateTimeFilter<'Unit'> | Date | string;
        },
        'id'
    >;

    export type UnitOrderByWithAggregationInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: UnitCountOrderByAggregateInput;
        _avg?: UnitAvgOrderByAggregateInput;
        _max?: UnitMaxOrderByAggregateInput;
        _min?: UnitMinOrderByAggregateInput;
        _sum?: UnitSumOrderByAggregateInput;
    };

    export type UnitScalarWhereWithAggregatesInput = {
        AND?:
            | UnitScalarWhereWithAggregatesInput
            | UnitScalarWhereWithAggregatesInput[];
        OR?: UnitScalarWhereWithAggregatesInput[];
        NOT?:
            | UnitScalarWhereWithAggregatesInput
            | UnitScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'Unit'> | number;
        name?: StringWithAggregatesFilter<'Unit'> | string;
        createdAt?: DateTimeWithAggregatesFilter<'Unit'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'Unit'> | Date | string;
    };

    export type RecipeIngredientWhereInput = {
        AND?: RecipeIngredientWhereInput | RecipeIngredientWhereInput[];
        OR?: RecipeIngredientWhereInput[];
        NOT?: RecipeIngredientWhereInput | RecipeIngredientWhereInput[];
        id?: IntFilter<'RecipeIngredient'> | number;
        recipeId?: IntFilter<'RecipeIngredient'> | number;
        ingredientId?: IntFilter<'RecipeIngredient'> | number;
        quantity?: StringFilter<'RecipeIngredient'> | string;
        createdAt?: DateTimeFilter<'RecipeIngredient'> | Date | string;
        updatedAt?: DateTimeFilter<'RecipeIngredient'> | Date | string;
    };

    export type RecipeIngredientOrderByWithRelationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
        quantity?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _relevance?: RecipeIngredientOrderByRelevanceInput;
    };

    export type RecipeIngredientWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: RecipeIngredientWhereInput | RecipeIngredientWhereInput[];
            OR?: RecipeIngredientWhereInput[];
            NOT?: RecipeIngredientWhereInput | RecipeIngredientWhereInput[];
            recipeId?: IntFilter<'RecipeIngredient'> | number;
            ingredientId?: IntFilter<'RecipeIngredient'> | number;
            quantity?: StringFilter<'RecipeIngredient'> | string;
            createdAt?: DateTimeFilter<'RecipeIngredient'> | Date | string;
            updatedAt?: DateTimeFilter<'RecipeIngredient'> | Date | string;
        },
        'id'
    >;

    export type RecipeIngredientOrderByWithAggregationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
        quantity?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: RecipeIngredientCountOrderByAggregateInput;
        _avg?: RecipeIngredientAvgOrderByAggregateInput;
        _max?: RecipeIngredientMaxOrderByAggregateInput;
        _min?: RecipeIngredientMinOrderByAggregateInput;
        _sum?: RecipeIngredientSumOrderByAggregateInput;
    };

    export type RecipeIngredientScalarWhereWithAggregatesInput = {
        AND?:
            | RecipeIngredientScalarWhereWithAggregatesInput
            | RecipeIngredientScalarWhereWithAggregatesInput[];
        OR?: RecipeIngredientScalarWhereWithAggregatesInput[];
        NOT?:
            | RecipeIngredientScalarWhereWithAggregatesInput
            | RecipeIngredientScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'RecipeIngredient'> | number;
        recipeId?: IntWithAggregatesFilter<'RecipeIngredient'> | number;
        ingredientId?: IntWithAggregatesFilter<'RecipeIngredient'> | number;
        quantity?: StringWithAggregatesFilter<'RecipeIngredient'> | string;
        createdAt?:
            | DateTimeWithAggregatesFilter<'RecipeIngredient'>
            | Date
            | string;
        updatedAt?:
            | DateTimeWithAggregatesFilter<'RecipeIngredient'>
            | Date
            | string;
    };

    export type RatingWhereInput = {
        AND?: RatingWhereInput | RatingWhereInput[];
        OR?: RatingWhereInput[];
        NOT?: RatingWhereInput | RatingWhereInput[];
        id?: IntFilter<'Rating'> | number;
        recipeId?: IntFilter<'Rating'> | number;
        userId?: IntFilter<'Rating'> | number;
        rating?: IntFilter<'Rating'> | number;
        createdAt?: DateTimeFilter<'Rating'> | Date | string;
        updatedAt?: DateTimeFilter<'Rating'> | Date | string;
    };

    export type RatingOrderByWithRelationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RatingWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: RatingWhereInput | RatingWhereInput[];
            OR?: RatingWhereInput[];
            NOT?: RatingWhereInput | RatingWhereInput[];
            recipeId?: IntFilter<'Rating'> | number;
            userId?: IntFilter<'Rating'> | number;
            rating?: IntFilter<'Rating'> | number;
            createdAt?: DateTimeFilter<'Rating'> | Date | string;
            updatedAt?: DateTimeFilter<'Rating'> | Date | string;
        },
        'id'
    >;

    export type RatingOrderByWithAggregationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: RatingCountOrderByAggregateInput;
        _avg?: RatingAvgOrderByAggregateInput;
        _max?: RatingMaxOrderByAggregateInput;
        _min?: RatingMinOrderByAggregateInput;
        _sum?: RatingSumOrderByAggregateInput;
    };

    export type RatingScalarWhereWithAggregatesInput = {
        AND?:
            | RatingScalarWhereWithAggregatesInput
            | RatingScalarWhereWithAggregatesInput[];
        OR?: RatingScalarWhereWithAggregatesInput[];
        NOT?:
            | RatingScalarWhereWithAggregatesInput
            | RatingScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'Rating'> | number;
        recipeId?: IntWithAggregatesFilter<'Rating'> | number;
        userId?: IntWithAggregatesFilter<'Rating'> | number;
        rating?: IntWithAggregatesFilter<'Rating'> | number;
        createdAt?: DateTimeWithAggregatesFilter<'Rating'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'Rating'> | Date | string;
    };

    export type InstructionWhereInput = {
        AND?: InstructionWhereInput | InstructionWhereInput[];
        OR?: InstructionWhereInput[];
        NOT?: InstructionWhereInput | InstructionWhereInput[];
        id?: IntFilter<'Instruction'> | number;
        recipeId?: IntFilter<'Instruction'> | number;
        step?: IntFilter<'Instruction'> | number;
        text?: StringFilter<'Instruction'> | string;
        createdAt?: DateTimeFilter<'Instruction'> | Date | string;
        updatedAt?: DateTimeFilter<'Instruction'> | Date | string;
    };

    export type InstructionOrderByWithRelationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
        text?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _relevance?: InstructionOrderByRelevanceInput;
    };

    export type InstructionWhereUniqueInput = Prisma.AtLeast<
        {
            id?: number;
            AND?: InstructionWhereInput | InstructionWhereInput[];
            OR?: InstructionWhereInput[];
            NOT?: InstructionWhereInput | InstructionWhereInput[];
            recipeId?: IntFilter<'Instruction'> | number;
            step?: IntFilter<'Instruction'> | number;
            text?: StringFilter<'Instruction'> | string;
            createdAt?: DateTimeFilter<'Instruction'> | Date | string;
            updatedAt?: DateTimeFilter<'Instruction'> | Date | string;
        },
        'id'
    >;

    export type InstructionOrderByWithAggregationInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
        text?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        _count?: InstructionCountOrderByAggregateInput;
        _avg?: InstructionAvgOrderByAggregateInput;
        _max?: InstructionMaxOrderByAggregateInput;
        _min?: InstructionMinOrderByAggregateInput;
        _sum?: InstructionSumOrderByAggregateInput;
    };

    export type InstructionScalarWhereWithAggregatesInput = {
        AND?:
            | InstructionScalarWhereWithAggregatesInput
            | InstructionScalarWhereWithAggregatesInput[];
        OR?: InstructionScalarWhereWithAggregatesInput[];
        NOT?:
            | InstructionScalarWhereWithAggregatesInput
            | InstructionScalarWhereWithAggregatesInput[];
        id?: IntWithAggregatesFilter<'Instruction'> | number;
        recipeId?: IntWithAggregatesFilter<'Instruction'> | number;
        step?: IntWithAggregatesFilter<'Instruction'> | number;
        text?: StringWithAggregatesFilter<'Instruction'> | string;
        createdAt?: DateTimeWithAggregatesFilter<'Instruction'> | Date | string;
        updatedAt?: DateTimeWithAggregatesFilter<'Instruction'> | Date | string;
    };

    export type UserCreateInput = {
        username: string;
        email: string;
        passwordHash?: string | null;
        authType?: string;
        role?: string;
        status?: string;
        avatarUrl?: string | null;
        emailVerified?: boolean;
        emailVerificationToken?: string | null;
        passwordResetToken?: string | null;
        passwordResetTokenExpires?: Date | string | null;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        lastLogin?: Date | string | null;
        lastPasswordReset?: Date | string | null;
    };

    export type UserUncheckedCreateInput = {
        id?: number;
        username: string;
        email: string;
        passwordHash?: string | null;
        authType?: string;
        role?: string;
        status?: string;
        avatarUrl?: string | null;
        emailVerified?: boolean;
        emailVerificationToken?: string | null;
        passwordResetToken?: string | null;
        passwordResetTokenExpires?: Date | string | null;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        lastLogin?: Date | string | null;
        lastPasswordReset?: Date | string | null;
    };

    export type UserUpdateInput = {
        username?: StringFieldUpdateOperationsInput | string;
        email?: StringFieldUpdateOperationsInput | string;
        passwordHash?: NullableStringFieldUpdateOperationsInput | string | null;
        authType?: StringFieldUpdateOperationsInput | string;
        role?: StringFieldUpdateOperationsInput | string;
        status?: StringFieldUpdateOperationsInput | string;
        avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
        emailVerified?: BoolFieldUpdateOperationsInput | boolean;
        emailVerificationToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetTokenExpires?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        lastLogin?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        lastPasswordReset?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
    };

    export type UserUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        username?: StringFieldUpdateOperationsInput | string;
        email?: StringFieldUpdateOperationsInput | string;
        passwordHash?: NullableStringFieldUpdateOperationsInput | string | null;
        authType?: StringFieldUpdateOperationsInput | string;
        role?: StringFieldUpdateOperationsInput | string;
        status?: StringFieldUpdateOperationsInput | string;
        avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
        emailVerified?: BoolFieldUpdateOperationsInput | boolean;
        emailVerificationToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetTokenExpires?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        lastLogin?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        lastPasswordReset?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
    };

    export type UserCreateManyInput = {
        id?: number;
        username: string;
        email: string;
        passwordHash?: string | null;
        authType?: string;
        role?: string;
        status?: string;
        avatarUrl?: string | null;
        emailVerified?: boolean;
        emailVerificationToken?: string | null;
        passwordResetToken?: string | null;
        passwordResetTokenExpires?: Date | string | null;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        lastLogin?: Date | string | null;
        lastPasswordReset?: Date | string | null;
    };

    export type UserUpdateManyMutationInput = {
        username?: StringFieldUpdateOperationsInput | string;
        email?: StringFieldUpdateOperationsInput | string;
        passwordHash?: NullableStringFieldUpdateOperationsInput | string | null;
        authType?: StringFieldUpdateOperationsInput | string;
        role?: StringFieldUpdateOperationsInput | string;
        status?: StringFieldUpdateOperationsInput | string;
        avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
        emailVerified?: BoolFieldUpdateOperationsInput | boolean;
        emailVerificationToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetTokenExpires?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        lastLogin?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        lastPasswordReset?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
    };

    export type UserUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        username?: StringFieldUpdateOperationsInput | string;
        email?: StringFieldUpdateOperationsInput | string;
        passwordHash?: NullableStringFieldUpdateOperationsInput | string | null;
        authType?: StringFieldUpdateOperationsInput | string;
        role?: StringFieldUpdateOperationsInput | string;
        status?: StringFieldUpdateOperationsInput | string;
        avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null;
        emailVerified?: BoolFieldUpdateOperationsInput | boolean;
        emailVerificationToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetToken?:
            | NullableStringFieldUpdateOperationsInput
            | string
            | null;
        passwordResetTokenExpires?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        lastLogin?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
        lastPasswordReset?:
            | NullableDateTimeFieldUpdateOperationsInput
            | Date
            | string
            | null;
    };

    export type RecipeCreateInput = {
        title: string;
        description: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeUncheckedCreateInput = {
        id?: number;
        title: string;
        description: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeUpdateInput = {
        title?: StringFieldUpdateOperationsInput | string;
        description?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        title?: StringFieldUpdateOperationsInput | string;
        description?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeCreateManyInput = {
        id?: number;
        title: string;
        description: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeUpdateManyMutationInput = {
        title?: StringFieldUpdateOperationsInput | string;
        description?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        title?: StringFieldUpdateOperationsInput | string;
        description?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type IngredientCreateInput = {
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type IngredientUncheckedCreateInput = {
        id?: number;
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type IngredientUpdateInput = {
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type IngredientUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type IngredientCreateManyInput = {
        id?: number;
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type IngredientUpdateManyMutationInput = {
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type IngredientUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type UnitCreateInput = {
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type UnitUncheckedCreateInput = {
        id?: number;
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type UnitUpdateInput = {
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type UnitUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type UnitCreateManyInput = {
        id?: number;
        name: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type UnitUpdateManyMutationInput = {
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type UnitUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        name?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeIngredientCreateInput = {
        recipeId: number;
        ingredientId: number;
        quantity: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeIngredientUncheckedCreateInput = {
        id?: number;
        recipeId: number;
        ingredientId: number;
        quantity: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeIngredientUpdateInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        ingredientId?: IntFieldUpdateOperationsInput | number;
        quantity?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeIngredientUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        ingredientId?: IntFieldUpdateOperationsInput | number;
        quantity?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeIngredientCreateManyInput = {
        id?: number;
        recipeId: number;
        ingredientId: number;
        quantity: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RecipeIngredientUpdateManyMutationInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        ingredientId?: IntFieldUpdateOperationsInput | number;
        quantity?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RecipeIngredientUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        ingredientId?: IntFieldUpdateOperationsInput | number;
        quantity?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RatingCreateInput = {
        recipeId: number;
        userId: number;
        rating: number;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RatingUncheckedCreateInput = {
        id?: number;
        recipeId: number;
        userId: number;
        rating: number;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RatingUpdateInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        userId?: IntFieldUpdateOperationsInput | number;
        rating?: IntFieldUpdateOperationsInput | number;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RatingUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        userId?: IntFieldUpdateOperationsInput | number;
        rating?: IntFieldUpdateOperationsInput | number;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RatingCreateManyInput = {
        id?: number;
        recipeId: number;
        userId: number;
        rating: number;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type RatingUpdateManyMutationInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        userId?: IntFieldUpdateOperationsInput | number;
        rating?: IntFieldUpdateOperationsInput | number;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type RatingUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        userId?: IntFieldUpdateOperationsInput | number;
        rating?: IntFieldUpdateOperationsInput | number;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type InstructionCreateInput = {
        recipeId: number;
        step: number;
        text: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type InstructionUncheckedCreateInput = {
        id?: number;
        recipeId: number;
        step: number;
        text: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type InstructionUpdateInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        step?: IntFieldUpdateOperationsInput | number;
        text?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type InstructionUncheckedUpdateInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        step?: IntFieldUpdateOperationsInput | number;
        text?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type InstructionCreateManyInput = {
        id?: number;
        recipeId: number;
        step: number;
        text: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
    };

    export type InstructionUpdateManyMutationInput = {
        recipeId?: IntFieldUpdateOperationsInput | number;
        step?: IntFieldUpdateOperationsInput | number;
        text?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type InstructionUncheckedUpdateManyInput = {
        id?: IntFieldUpdateOperationsInput | number;
        recipeId?: IntFieldUpdateOperationsInput | number;
        step?: IntFieldUpdateOperationsInput | number;
        text?: StringFieldUpdateOperationsInput | string;
        createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
        updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

    export type IntFilter<$PrismaModel = never> = {
        equals?: number | IntFieldRefInput<$PrismaModel>;
        in?: number[];
        notIn?: number[];
        lt?: number | IntFieldRefInput<$PrismaModel>;
        lte?: number | IntFieldRefInput<$PrismaModel>;
        gt?: number | IntFieldRefInput<$PrismaModel>;
        gte?: number | IntFieldRefInput<$PrismaModel>;
        not?: NestedIntFilter<$PrismaModel> | number;
    };

    export type StringFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel>;
        in?: string[];
        notIn?: string[];
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringFilter<$PrismaModel> | string;
    };

    export type StringNullableFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel> | null;
        in?: string[] | null;
        notIn?: string[] | null;
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringNullableFilter<$PrismaModel> | string | null;
    };

    export type BoolFilter<$PrismaModel = never> = {
        equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
        not?: NestedBoolFilter<$PrismaModel> | boolean;
    };

    export type DateTimeNullableFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
        in?: Date[] | string[] | null;
        notIn?: Date[] | string[] | null;
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
    };

    export type DateTimeFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        in?: Date[] | string[];
        notIn?: Date[] | string[];
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
    };

    export type SortOrderInput = {
        sort: SortOrder;
        nulls?: NullsOrder;
    };

    export type UserOrderByRelevanceInput = {
        fields: UserOrderByRelevanceFieldEnum | UserOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type UserCountOrderByAggregateInput = {
        id?: SortOrder;
        username?: SortOrder;
        email?: SortOrder;
        passwordHash?: SortOrder;
        authType?: SortOrder;
        role?: SortOrder;
        status?: SortOrder;
        avatarUrl?: SortOrder;
        emailVerified?: SortOrder;
        emailVerificationToken?: SortOrder;
        passwordResetToken?: SortOrder;
        passwordResetTokenExpires?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        lastLogin?: SortOrder;
        lastPasswordReset?: SortOrder;
    };

    export type UserAvgOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type UserMaxOrderByAggregateInput = {
        id?: SortOrder;
        username?: SortOrder;
        email?: SortOrder;
        passwordHash?: SortOrder;
        authType?: SortOrder;
        role?: SortOrder;
        status?: SortOrder;
        avatarUrl?: SortOrder;
        emailVerified?: SortOrder;
        emailVerificationToken?: SortOrder;
        passwordResetToken?: SortOrder;
        passwordResetTokenExpires?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        lastLogin?: SortOrder;
        lastPasswordReset?: SortOrder;
    };

    export type UserMinOrderByAggregateInput = {
        id?: SortOrder;
        username?: SortOrder;
        email?: SortOrder;
        passwordHash?: SortOrder;
        authType?: SortOrder;
        role?: SortOrder;
        status?: SortOrder;
        avatarUrl?: SortOrder;
        emailVerified?: SortOrder;
        emailVerificationToken?: SortOrder;
        passwordResetToken?: SortOrder;
        passwordResetTokenExpires?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
        lastLogin?: SortOrder;
        lastPasswordReset?: SortOrder;
    };

    export type UserSumOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type IntWithAggregatesFilter<$PrismaModel = never> = {
        equals?: number | IntFieldRefInput<$PrismaModel>;
        in?: number[];
        notIn?: number[];
        lt?: number | IntFieldRefInput<$PrismaModel>;
        lte?: number | IntFieldRefInput<$PrismaModel>;
        gt?: number | IntFieldRefInput<$PrismaModel>;
        gte?: number | IntFieldRefInput<$PrismaModel>;
        not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
        _count?: NestedIntFilter<$PrismaModel>;
        _avg?: NestedFloatFilter<$PrismaModel>;
        _sum?: NestedIntFilter<$PrismaModel>;
        _min?: NestedIntFilter<$PrismaModel>;
        _max?: NestedIntFilter<$PrismaModel>;
    };

    export type StringWithAggregatesFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel>;
        in?: string[];
        notIn?: string[];
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedStringFilter<$PrismaModel>;
        _max?: NestedStringFilter<$PrismaModel>;
    };

    export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel> | null;
        in?: string[] | null;
        notIn?: string[] | null;
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?:
            | NestedStringNullableWithAggregatesFilter<$PrismaModel>
            | string
            | null;
        _count?: NestedIntNullableFilter<$PrismaModel>;
        _min?: NestedStringNullableFilter<$PrismaModel>;
        _max?: NestedStringNullableFilter<$PrismaModel>;
    };

    export type BoolWithAggregatesFilter<$PrismaModel = never> = {
        equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
        not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedBoolFilter<$PrismaModel>;
        _max?: NestedBoolFilter<$PrismaModel>;
    };

    export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
        in?: Date[] | string[] | null;
        notIn?: Date[] | string[] | null;
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?:
            | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
            | Date
            | string
            | null;
        _count?: NestedIntNullableFilter<$PrismaModel>;
        _min?: NestedDateTimeNullableFilter<$PrismaModel>;
        _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

    export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        in?: Date[] | string[];
        notIn?: Date[] | string[];
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedDateTimeFilter<$PrismaModel>;
        _max?: NestedDateTimeFilter<$PrismaModel>;
    };

    export type RecipeOrderByRelevanceInput = {
        fields:
            | RecipeOrderByRelevanceFieldEnum
            | RecipeOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type RecipeCountOrderByAggregateInput = {
        id?: SortOrder;
        title?: SortOrder;
        description?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeAvgOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type RecipeMaxOrderByAggregateInput = {
        id?: SortOrder;
        title?: SortOrder;
        description?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeMinOrderByAggregateInput = {
        id?: SortOrder;
        title?: SortOrder;
        description?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeSumOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type IngredientOrderByRelevanceInput = {
        fields:
            | IngredientOrderByRelevanceFieldEnum
            | IngredientOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type IngredientCountOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type IngredientAvgOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type IngredientMaxOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type IngredientMinOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type IngredientSumOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type UnitOrderByRelevanceInput = {
        fields: UnitOrderByRelevanceFieldEnum | UnitOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type UnitCountOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type UnitAvgOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type UnitMaxOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type UnitMinOrderByAggregateInput = {
        id?: SortOrder;
        name?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type UnitSumOrderByAggregateInput = {
        id?: SortOrder;
    };

    export type RecipeIngredientOrderByRelevanceInput = {
        fields:
            | RecipeIngredientOrderByRelevanceFieldEnum
            | RecipeIngredientOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type RecipeIngredientCountOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
        quantity?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeIngredientAvgOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
    };

    export type RecipeIngredientMaxOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
        quantity?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeIngredientMinOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
        quantity?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RecipeIngredientSumOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        ingredientId?: SortOrder;
    };

    export type RatingCountOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RatingAvgOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
    };

    export type RatingMaxOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RatingMinOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type RatingSumOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        userId?: SortOrder;
        rating?: SortOrder;
    };

    export type InstructionOrderByRelevanceInput = {
        fields:
            | InstructionOrderByRelevanceFieldEnum
            | InstructionOrderByRelevanceFieldEnum[];
        sort: SortOrder;
        search: string;
    };

    export type InstructionCountOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
        text?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type InstructionAvgOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
    };

    export type InstructionMaxOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
        text?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type InstructionMinOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
        text?: SortOrder;
        createdAt?: SortOrder;
        updatedAt?: SortOrder;
    };

    export type InstructionSumOrderByAggregateInput = {
        id?: SortOrder;
        recipeId?: SortOrder;
        step?: SortOrder;
    };

    export type StringFieldUpdateOperationsInput = {
        set?: string;
    };

    export type NullableStringFieldUpdateOperationsInput = {
        set?: string | null;
    };

    export type BoolFieldUpdateOperationsInput = {
        set?: boolean;
    };

    export type NullableDateTimeFieldUpdateOperationsInput = {
        set?: Date | string | null;
    };

    export type DateTimeFieldUpdateOperationsInput = {
        set?: Date | string;
    };

    export type IntFieldUpdateOperationsInput = {
        set?: number;
        increment?: number;
        decrement?: number;
        multiply?: number;
        divide?: number;
    };

    export type NestedIntFilter<$PrismaModel = never> = {
        equals?: number | IntFieldRefInput<$PrismaModel>;
        in?: number[];
        notIn?: number[];
        lt?: number | IntFieldRefInput<$PrismaModel>;
        lte?: number | IntFieldRefInput<$PrismaModel>;
        gt?: number | IntFieldRefInput<$PrismaModel>;
        gte?: number | IntFieldRefInput<$PrismaModel>;
        not?: NestedIntFilter<$PrismaModel> | number;
    };

    export type NestedStringFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel>;
        in?: string[];
        notIn?: string[];
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringFilter<$PrismaModel> | string;
    };

    export type NestedStringNullableFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel> | null;
        in?: string[] | null;
        notIn?: string[] | null;
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringNullableFilter<$PrismaModel> | string | null;
    };

    export type NestedBoolFilter<$PrismaModel = never> = {
        equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
        not?: NestedBoolFilter<$PrismaModel> | boolean;
    };

    export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
        in?: Date[] | string[] | null;
        notIn?: Date[] | string[] | null;
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
    };

    export type NestedDateTimeFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        in?: Date[] | string[];
        notIn?: Date[] | string[];
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
    };

    export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
        equals?: number | IntFieldRefInput<$PrismaModel>;
        in?: number[];
        notIn?: number[];
        lt?: number | IntFieldRefInput<$PrismaModel>;
        lte?: number | IntFieldRefInput<$PrismaModel>;
        gt?: number | IntFieldRefInput<$PrismaModel>;
        gte?: number | IntFieldRefInput<$PrismaModel>;
        not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
        _count?: NestedIntFilter<$PrismaModel>;
        _avg?: NestedFloatFilter<$PrismaModel>;
        _sum?: NestedIntFilter<$PrismaModel>;
        _min?: NestedIntFilter<$PrismaModel>;
        _max?: NestedIntFilter<$PrismaModel>;
    };

    export type NestedFloatFilter<$PrismaModel = never> = {
        equals?: number | FloatFieldRefInput<$PrismaModel>;
        in?: number[];
        notIn?: number[];
        lt?: number | FloatFieldRefInput<$PrismaModel>;
        lte?: number | FloatFieldRefInput<$PrismaModel>;
        gt?: number | FloatFieldRefInput<$PrismaModel>;
        gte?: number | FloatFieldRefInput<$PrismaModel>;
        not?: NestedFloatFilter<$PrismaModel> | number;
    };

    export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
        equals?: string | StringFieldRefInput<$PrismaModel>;
        in?: string[];
        notIn?: string[];
        lt?: string | StringFieldRefInput<$PrismaModel>;
        lte?: string | StringFieldRefInput<$PrismaModel>;
        gt?: string | StringFieldRefInput<$PrismaModel>;
        gte?: string | StringFieldRefInput<$PrismaModel>;
        contains?: string | StringFieldRefInput<$PrismaModel>;
        startsWith?: string | StringFieldRefInput<$PrismaModel>;
        endsWith?: string | StringFieldRefInput<$PrismaModel>;
        search?: string;
        not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedStringFilter<$PrismaModel>;
        _max?: NestedStringFilter<$PrismaModel>;
    };

    export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> =
        {
            equals?: string | StringFieldRefInput<$PrismaModel> | null;
            in?: string[] | null;
            notIn?: string[] | null;
            lt?: string | StringFieldRefInput<$PrismaModel>;
            lte?: string | StringFieldRefInput<$PrismaModel>;
            gt?: string | StringFieldRefInput<$PrismaModel>;
            gte?: string | StringFieldRefInput<$PrismaModel>;
            contains?: string | StringFieldRefInput<$PrismaModel>;
            startsWith?: string | StringFieldRefInput<$PrismaModel>;
            endsWith?: string | StringFieldRefInput<$PrismaModel>;
            search?: string;
            not?:
                | NestedStringNullableWithAggregatesFilter<$PrismaModel>
                | string
                | null;
            _count?: NestedIntNullableFilter<$PrismaModel>;
            _min?: NestedStringNullableFilter<$PrismaModel>;
            _max?: NestedStringNullableFilter<$PrismaModel>;
        };

    export type NestedIntNullableFilter<$PrismaModel = never> = {
        equals?: number | IntFieldRefInput<$PrismaModel> | null;
        in?: number[] | null;
        notIn?: number[] | null;
        lt?: number | IntFieldRefInput<$PrismaModel>;
        lte?: number | IntFieldRefInput<$PrismaModel>;
        gt?: number | IntFieldRefInput<$PrismaModel>;
        gte?: number | IntFieldRefInput<$PrismaModel>;
        not?: NestedIntNullableFilter<$PrismaModel> | number | null;
    };

    export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
        equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
        not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedBoolFilter<$PrismaModel>;
        _max?: NestedBoolFilter<$PrismaModel>;
    };

    export type NestedDateTimeNullableWithAggregatesFilter<
        $PrismaModel = never
    > = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
        in?: Date[] | string[] | null;
        notIn?: Date[] | string[] | null;
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?:
            | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
            | Date
            | string
            | null;
        _count?: NestedIntNullableFilter<$PrismaModel>;
        _min?: NestedDateTimeNullableFilter<$PrismaModel>;
        _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

    export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
        equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        in?: Date[] | string[];
        notIn?: Date[] | string[];
        lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
        not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
        _count?: NestedIntFilter<$PrismaModel>;
        _min?: NestedDateTimeFilter<$PrismaModel>;
        _max?: NestedDateTimeFilter<$PrismaModel>;
    };

    /**
     * Batch Payload for updateMany & deleteMany & createMany
     */

    export type BatchPayload = {
        count: number;
    };

    /**
     * DMMF
     */
    export const dmmf: runtime.BaseDMMF;
}
