import React from 'react'
import { render } from 'react-dom'
import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import App from './App'
import { ApolloProvider } from 'react-apollo'
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from 'apollo-link-context';

const link = createHttpLink({ uri: 'http://localhost:4000/graphql', fetch: fetch as any });
const client = new ApolloClient({
    link: setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: localStorage.getItem('token')
        }
      }
    }).concat(link),
    cache: new InMemoryCache(),
})

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);