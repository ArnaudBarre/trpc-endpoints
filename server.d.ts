import { AnyRouter } from "@trpc/server";

export type Endpoint<Context> = <
  Output,
  SchemaInput = never,
  SchemaOutput = never,
>(props: {
  input?: { _input: SchemaInput; _output: SchemaOutput };
  resolve: (props: { input: SchemaOutput; ctx: Context }) => Promise<Output>;
}) => { input: SchemaInput; output: Output };

declare const createEndpoint: <ContextIn, ContextOut>(
  middleware?: (props: { ctx: ContextIn; next: () => "NEXT" }) => "NEXT",
) => Endpoint<ContextOut>;

declare const mergeEndpoints: (endpoints: {
  queries: Record<string, { input: unknown; output: unknown }>;
  mutations: Record<string, { input: unknown; output: unknown }>;
}) => AnyRouter;
