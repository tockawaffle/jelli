/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adapter from "../adapter.js";
import type * as auth from "../auth.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adapter: typeof adapter;
  auth: typeof auth;
}>;
export type Mounts = {
  adapter: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              data: {
                createdAt: number;
                email: string;
                emailVerified: boolean;
                image?: null | string;
                metadata?:
                  | null
                  | {}
                  | {
                      bio: string;
                      isOnline?: null | boolean;
                      name: { firstName: string; lastName: string };
                    };
                name: string;
                twoFactorEnabled?: null | boolean;
                updatedAt: number;
                userId?: null | string;
              };
              model: "user";
            }
          | {
              data: {
                activeOrganizationId?: null | string;
                createdAt: number;
                expiresAt: number;
                ipAddress?: null | string;
                token: string;
                updatedAt: number;
                userAgent?: null | string;
                userId: string;
              };
              model: "session";
            }
          | {
              data: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId: string;
                createdAt: number;
                idToken?: null | string;
                password?: null | string;
                providerId: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt: number;
                userId: string;
              };
              model: "account";
            }
          | {
              data: {
                createdAt: number;
                expiresAt: number;
                identifier: string;
                updatedAt: number;
                value: string;
              };
              model: "verification";
            }
          | {
              data: {
                createdAt: number;
                privateKey: string;
                publicKey: string;
              };
              model: "jwks";
            }
          | {
              data: {
                createdAt: number;
                logo?: null | string;
                metadata?: null | string;
                name: string;
                slug: string;
              };
              model: "organization";
            }
          | {
              data: {
                createdAt: number;
                organizationId: string;
                role: string;
                userId: string;
              };
              model: "member";
            }
          | {
              data: {
                email: string;
                expiresAt: number;
                inviterId: string;
                organizationId: string;
                role?: null | string;
                status: string;
              };
              model: "invitation";
            }
          | {
              data: { backupCodes: string; secret: string; userId: string };
              model: "twoFactor";
            }
          | {
              data: {
                clientId?: null | string;
                deviceCode: string;
                expiresAt: number;
                lastPolledAt?: null | number;
                pollingInterval?: null | number;
                scope?: null | string;
                status: string;
                userCode: string;
                userId?: null | string;
              };
              model: "deviceCode";
            }
          | {
              data: {
                action: string;
                ipAddress: string;
                severity: string;
                timestamp: string;
                type: string;
                userAgent: string;
                userId: string;
              };
              model: "auditLogs";
            }
          | {
              data: {
                clockIn: string;
                clockOut: string;
                date: string;
                earlyOut: boolean;
                lunchBreakOut: string;
                lunchBreakReturn: string;
                operation: Array<string>;
                orgId: string;
                role: string;
                status: string;
                timesUpdated: number;
                totalBreakSeconds: number;
                totalWorkSeconds: number;
                userId: string;
                wasLate: boolean;
              };
              model: "attendance";
            };
        onCreateHandle?: string;
        select?: Array<string>;
      },
      any
    >;
    deleteMany: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "userId"
                  | "twoFactorEnabled"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "activeOrganizationId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "organization";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "slug"
                  | "logo"
                  | "createdAt"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "member";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "userId"
                  | "role"
                  | "createdAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "invitation";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "email"
                  | "role"
                  | "status"
                  | "expiresAt"
                  | "inviterId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "deviceCode";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "deviceCode"
                  | "userCode"
                  | "userId"
                  | "expiresAt"
                  | "status"
                  | "lastPolledAt"
                  | "pollingInterval"
                  | "clientId"
                  | "scope"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "auditLogs";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "action"
                  | "timestamp"
                  | "ipAddress"
                  | "userAgent"
                  | "severity"
                  | "type"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "attendance";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "orgId"
                  | "role"
                  | "date"
                  | "clockIn"
                  | "lunchBreakOut"
                  | "lunchBreakReturn"
                  | "clockOut"
                  | "status"
                  | "totalWorkSeconds"
                  | "totalBreakSeconds"
                  | "wasLate"
                  | "earlyOut"
                  | "timesUpdated"
                  | "operation"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onDeleteHandle?: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      any
    >;
    deleteOne: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "userId"
                  | "twoFactorEnabled"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "activeOrganizationId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "organization";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "slug"
                  | "logo"
                  | "createdAt"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "member";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "userId"
                  | "role"
                  | "createdAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "invitation";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "email"
                  | "role"
                  | "status"
                  | "expiresAt"
                  | "inviterId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "deviceCode";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "deviceCode"
                  | "userCode"
                  | "userId"
                  | "expiresAt"
                  | "status"
                  | "lastPolledAt"
                  | "pollingInterval"
                  | "clientId"
                  | "scope"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "auditLogs";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "action"
                  | "timestamp"
                  | "ipAddress"
                  | "userAgent"
                  | "severity"
                  | "type"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "attendance";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "orgId"
                  | "role"
                  | "date"
                  | "clockIn"
                  | "lunchBreakOut"
                  | "lunchBreakReturn"
                  | "clockOut"
                  | "status"
                  | "totalWorkSeconds"
                  | "totalBreakSeconds"
                  | "wasLate"
                  | "earlyOut"
                  | "timesUpdated"
                  | "operation"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onDeleteHandle?: string;
      },
      any
    >;
    findMany: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model:
          | "user"
          | "session"
          | "account"
          | "verification"
          | "jwks"
          | "organization"
          | "member"
          | "invitation"
          | "twoFactor"
          | "deviceCode"
          | "auditLogs"
          | "attendance";
        offset?: number;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        sortBy?: { direction: "asc" | "desc"; field: string };
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "not_in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    findOne: FunctionReference<
      "query",
      "public",
      {
        model:
          | "user"
          | "session"
          | "account"
          | "verification"
          | "jwks"
          | "organization"
          | "member"
          | "invitation"
          | "twoFactor"
          | "deviceCode"
          | "auditLogs"
          | "attendance";
        select?: Array<string>;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "not_in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    updateMany: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              update: {
                createdAt?: number;
                email?: string;
                emailVerified?: boolean;
                image?: null | string;
                metadata?:
                  | null
                  | {}
                  | {
                      bio: string;
                      isOnline?: null | boolean;
                      name: { firstName: string; lastName: string };
                    };
                name?: string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "userId"
                  | "twoFactorEnabled"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              update: {
                activeOrganizationId?: null | string;
                createdAt?: number;
                expiresAt?: number;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "activeOrganizationId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId?: string;
                createdAt?: number;
                idToken?: null | string;
                password?: null | string;
                providerId?: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt?: number;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              update: {
                createdAt?: number;
                expiresAt?: number;
                identifier?: string;
                updatedAt?: number;
                value?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              update: {
                createdAt?: number;
                privateKey?: string;
                publicKey?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "organization";
              update: {
                createdAt?: number;
                logo?: null | string;
                metadata?: null | string;
                name?: string;
                slug?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "slug"
                  | "logo"
                  | "createdAt"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "member";
              update: {
                createdAt?: number;
                organizationId?: string;
                role?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "userId"
                  | "role"
                  | "createdAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "invitation";
              update: {
                email?: string;
                expiresAt?: number;
                inviterId?: string;
                organizationId?: string;
                role?: null | string;
                status?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "email"
                  | "role"
                  | "status"
                  | "expiresAt"
                  | "inviterId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              update: {
                backupCodes?: string;
                secret?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "deviceCode";
              update: {
                clientId?: null | string;
                deviceCode?: string;
                expiresAt?: number;
                lastPolledAt?: null | number;
                pollingInterval?: null | number;
                scope?: null | string;
                status?: string;
                userCode?: string;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "deviceCode"
                  | "userCode"
                  | "userId"
                  | "expiresAt"
                  | "status"
                  | "lastPolledAt"
                  | "pollingInterval"
                  | "clientId"
                  | "scope"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "auditLogs";
              update: {
                action?: string;
                ipAddress?: string;
                severity?: string;
                timestamp?: string;
                type?: string;
                userAgent?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "action"
                  | "timestamp"
                  | "ipAddress"
                  | "userAgent"
                  | "severity"
                  | "type"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "attendance";
              update: {
                clockIn?: string;
                clockOut?: string;
                date?: string;
                earlyOut?: boolean;
                lunchBreakOut?: string;
                lunchBreakReturn?: string;
                operation?: Array<string>;
                orgId?: string;
                role?: string;
                status?: string;
                timesUpdated?: number;
                totalBreakSeconds?: number;
                totalWorkSeconds?: number;
                userId?: string;
                wasLate?: boolean;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "orgId"
                  | "role"
                  | "date"
                  | "clockIn"
                  | "lunchBreakOut"
                  | "lunchBreakReturn"
                  | "clockOut"
                  | "status"
                  | "totalWorkSeconds"
                  | "totalBreakSeconds"
                  | "wasLate"
                  | "earlyOut"
                  | "timesUpdated"
                  | "operation"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onUpdateHandle?: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      any
    >;
    updateOne: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              update: {
                createdAt?: number;
                email?: string;
                emailVerified?: boolean;
                image?: null | string;
                metadata?:
                  | null
                  | {}
                  | {
                      bio: string;
                      isOnline?: null | boolean;
                      name: { firstName: string; lastName: string };
                    };
                name?: string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "userId"
                  | "twoFactorEnabled"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              update: {
                activeOrganizationId?: null | string;
                createdAt?: number;
                expiresAt?: number;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "activeOrganizationId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId?: string;
                createdAt?: number;
                idToken?: null | string;
                password?: null | string;
                providerId?: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt?: number;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              update: {
                createdAt?: number;
                expiresAt?: number;
                identifier?: string;
                updatedAt?: number;
                value?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              update: {
                createdAt?: number;
                privateKey?: string;
                publicKey?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "organization";
              update: {
                createdAt?: number;
                logo?: null | string;
                metadata?: null | string;
                name?: string;
                slug?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "slug"
                  | "logo"
                  | "createdAt"
                  | "metadata"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "member";
              update: {
                createdAt?: number;
                organizationId?: string;
                role?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "userId"
                  | "role"
                  | "createdAt"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "invitation";
              update: {
                email?: string;
                expiresAt?: number;
                inviterId?: string;
                organizationId?: string;
                role?: null | string;
                status?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "organizationId"
                  | "email"
                  | "role"
                  | "status"
                  | "expiresAt"
                  | "inviterId"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              update: {
                backupCodes?: string;
                secret?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "deviceCode";
              update: {
                clientId?: null | string;
                deviceCode?: string;
                expiresAt?: number;
                lastPolledAt?: null | number;
                pollingInterval?: null | number;
                scope?: null | string;
                status?: string;
                userCode?: string;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "deviceCode"
                  | "userCode"
                  | "userId"
                  | "expiresAt"
                  | "status"
                  | "lastPolledAt"
                  | "pollingInterval"
                  | "clientId"
                  | "scope"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "auditLogs";
              update: {
                action?: string;
                ipAddress?: string;
                severity?: string;
                timestamp?: string;
                type?: string;
                userAgent?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "action"
                  | "timestamp"
                  | "ipAddress"
                  | "userAgent"
                  | "severity"
                  | "type"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "attendance";
              update: {
                clockIn?: string;
                clockOut?: string;
                date?: string;
                earlyOut?: boolean;
                lunchBreakOut?: string;
                lunchBreakReturn?: string;
                operation?: Array<string>;
                orgId?: string;
                role?: string;
                status?: string;
                timesUpdated?: number;
                totalBreakSeconds?: number;
                totalWorkSeconds?: number;
                userId?: string;
                wasLate?: boolean;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "userId"
                  | "orgId"
                  | "role"
                  | "date"
                  | "clockIn"
                  | "lunchBreakOut"
                  | "lunchBreakReturn"
                  | "clockOut"
                  | "status"
                  | "totalWorkSeconds"
                  | "totalBreakSeconds"
                  | "wasLate"
                  | "earlyOut"
                  | "timesUpdated"
                  | "operation"
                  | "_id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "not_in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onUpdateHandle?: string;
      },
      any
    >;
  };
};
// For now fullApiWithMounts is only fullApi which provides
// jump-to-definition in component client code.
// Use Mounts for the same type without the inference.
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
