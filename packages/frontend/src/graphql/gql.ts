const GQL_URL = import.meta.env.VITE_GRAPHQL_URL! as string;

export type GqlErorr = {
  errors?: any;
};

const gqlRequest = async <Query, Vars extends object = {}>(
  query: string,
  variables: Vars
): Promise<Query & GqlErorr> => {
  const request = await fetch(GQL_URL, {
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
    credentials: "include",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await request.json();
  const data = json.data as Query;

  return {
    ...data,
    errors: json.errors,
  };
};

export default gqlRequest;
