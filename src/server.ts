import {ApolloServer} from 'apollo-server';
const typeDefs = `
type Query {
    totalPhotos: Int!
}`
;

const resolvers = {
  Query: {
    totalPhotos: () => 41,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`));
