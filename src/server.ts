import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { readFileSync } from 'fs';
import * as resolvers from './resolvers';
import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoClient } from 'mongodb';

config({ path: resolve(__dirname, '../.env') });

const typeDefs = readFileSync('./typeDef.graphql', 'UTF-8');

/**
 * Start server
 */
async function start() {
  const app = express();
  const MONGO_DB = process.env.DB_HOST as string;
  const client = await MongoClient.connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db();
  const context = { db };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });
  server.applyMiddleware({ app });

  app.get('/', (req, res) => res.end('Welcome to PhotoShare API'));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Service running on http://localhost:4000/${server.graphqlPath}`,
    ),
  );
}

start();
