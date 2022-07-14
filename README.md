# trpc-endpoints [![npm](https://img.shields.io/npm/v/@arnaud-barre/trpc-endpoints)](https://www.npmjs.com/package/@arnaud-barre/trpc-endpoints)

A POC to use [trpc](https://github.com/trpc/trpc) v9 with an API inspired by the upcoming v10 that allows navigation from the client code to the server code.

The current implementations comes with a lot of limitations: no subscriptions, single level middleware, async type for resolver, no output validation and many other I'm probably missing.

Requires node >= v14.17.

## Install

`yarn add @arnaud-barre/trpc-endpoints`

## Server

First, you need to create endpoints which contains the code you would use in midelwares.

```ts
import { createEndpoint } from "@arnaud-barre/trpc-endpoints/server";
import { TRPCError } from "@trpc/server";

export type UnauthContext = { user?: User }
export type AuthContext = { user: User }

export const unauthEndpoint = createEndpoint<UnauthContext, UnauthContext>();

export const authEndpoint = createEndpoint<
  UnauthContext, // Context before middleware
  AuthContext // Context after middleware
>(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});

export const adminEndpoint = createEndpoint<
  UnauthContext, 
  AuthContext
>(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.isAdmin) throw new TRPCError({ code: "UNAUTHORIZED" })
  return next();
});
```

Then use them to creates endpoints:

```ts
import { z } from "zod";
import { authEndpoint } from "../utils/endpoints.ts";

export const userMutations = {
  "user.reset": authEndpoint({
    input: z.object({ username: z.string() }),
    resolve: async ({ ctx, input }) => {
      // Implementation
    },
  }),
  "user.delete": authEndpoint({
    input: z.object({ uuid: z.string() }),
    resolve: async ({ ctx, input }) => {
      // Implementation
    },
  }),
};

export const userQueries = {
  "user.list": authEndpoint({
    resolve: ({ ctx }) => ctx.prisma.user.findMany(),
  }),
  "user.get": authEndpoint({
    input: z.object({ uuid: z.string().uuid() }),
    resolve: ({ ctx, input }) =>
      ctx.prisma.user.findUnique({ where: { uuid: input.uuid } })
  })
};
```

Finally, merge all endpoints into an object and use it to create the trpc router  

```ts
import { mergeEndpoints } from "@arnaud-barre/trpc-endpoints/server";
import { adminMutations, adminQueries } from "./api/admin";
import { userMutations, userQueries } from "./api/user";

const allEndpoints = {
  queries: {
    ...adminQueries,
    ...userQueries,
  },
  mutations: {
    ...adminMutations,
    ...userMutations,
  },
};

export type AllEndpoints = typeof allEndpoints;

const appRouter = mergeEndpoints(allEndpoints)
  // .formatError( ... )
  // .transformer(superjson)
```

## Client

This just a re-export of `@trpc/react` but with `useQuery` and `useMutation` typed via `AllEndpoints`

```ts
import { createReactQueryHooks } from "@arnaud-barre/trpc-endpoints/react";
import type { AllEndpoints } from "../../server";

export const trpc = createReactQueryHooks<AllEndpoints>();
```
