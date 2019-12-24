import React from 'react'
import { render } from 'react-dom'
import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import App from './App'
import { ApolloProvider } from 'react-apollo'
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from "apollo-cache-inmemory";

const link = createHttpLink({ uri: 'http://localhost:4000/graphql', fetch: fetch as any });
const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
})

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);