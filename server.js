import { randomUUID } from "crypto";
import { router } from "@trpc/server";

const subRouters = [];
const endpointsBuffer = {};

export const createEndpoint = (middleware) => {
  const subRouter = middleware ? router().middleware(middleware) : router();
  const length = subRouters.push(subRouter);
  return ({ input, resolve }) => {
    const uuid = randomUUID();
    endpointsBuffer[uuid] = { index: length - 1, resolve, input };
    return uuid;
  };
};

export const mergeEndpoints = (endpoints) => {
  for (const queryName in endpoints.queries) {
    const endpoint = endpointsBuffer[endpoints.queries[queryName]];
    subRouters[endpoint.index] = subRouters[endpoint.index].query(
      queryName,
      endpoint.input
        ? { input: endpoint.input, resolve: endpoint.resolve }
        : { resolve: endpoint.resolve },
    );
  }
  for (const mutationName in endpoints.mutations) {
    const endpoint = endpointsBuffer[endpoints.mutations[mutationName]];
    subRouters[endpoint.index] = subRouters[endpoint.index].mutation(
      mutationName,
      endpoint.input
        ? { input: endpoint.input, resolve: endpoint.resolve }
        : { resolve: endpoint.resolve },
    );
  }
  let mainRouter = router();
  for (const subRouter of subRouters) mainRouter = mainRouter.merge(subRouter);
  return mainRouter;
};
