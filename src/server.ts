import {ApolloServer} from 'apollo-server-express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import {readFileSync} from 'fs';
import * as resolvers from './resolvers';

const typeDefs = readFileSync('./typeDef.graphql', 'UTF-8');

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
server.applyMiddleware({app});

app.get('/', (req, res) => res.end('Welcome to PhotoShare API'));
app.get('/playground', expressPlayground({endpoint: '/graphql'}));
app
    .listen({port: 4000}, () =>
      console.log(`GraphQL Service running on http://localhost:4000/${server.graphqlPath}`),
    );
