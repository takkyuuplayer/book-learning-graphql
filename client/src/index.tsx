import { gql } from 'apollo-boost'
import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from "apollo-cache-inmemory";

const link = createHttpLink({ uri: 'http://localhost:4000/graphql', fetch: fetch as any });

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
})

const query = gql`
{
    totalUsers
    totalPhotos
}
`

client.query({query})
    .then(({data}) => console.log('data', data))
    .catch(console.error)

/* import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
 */