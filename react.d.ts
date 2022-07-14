import {
  createReactQueryHooks as baseCreateReactQueryHooks,
  UseTRPCMutationOptions,
  UseTRPCQueryOptions,
} from "@trpc/react";
import { DefaultErrorShape } from "@trpc/server";
import { UseQueryResult, UseMutationResult } from "react-query";

type DefaultError = {
  readonly message: string;
  readonly shape: DefaultErrorShape;
  readonly data: DefaultErrorShape["data"];
};

declare const createReactQueryHooks: <
  AllEndpoints extends {
    queries: Record<string, { input: unknown; output: unknown }>;
    mutations: Record<string, { input: unknown; output: unknown }>;
  },
>() => ReturnType<typeof baseCreateReactQueryHooks> & {
  useQuery: <Path extends keyof AllEndpoints["queries"]>(
    pathAndInput: [
      path: Path,
      variables?: AllEndpoints["queries"][Path]["input"],
    ],
    opts?: UseTRPCQueryOptions<
      Path,
      AllEndpoints["queries"][Path]["input"],
      AllEndpoints["queries"][Path]["output"],
      AllEndpoints["queries"][Path]["output"],
      DefaultError
    >,
  ) => UseQueryResult<AllEndpoints["queries"][Path]["output"], DefaultError>;
  useMutation: <Path extends keyof AllEndpoints["mutations"]>(
    path: Path,
    opts?: UseTRPCMutationOptions<
      AllEndpoints["mutations"][Path]["input"],
      DefaultError,
      AllEndpoints["queries"][Path]["output"]
    >,
  ) => UseMutationResult<
    AllEndpoints["queries"][Path]["output"],
    DefaultError,
    AllEndpoints["mutations"][Path]["input"]
  >;
};
