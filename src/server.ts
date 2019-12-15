import {ulid} from 'ulid';
import {ApolloServer} from 'apollo-server';
const typeDefs = `
type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
}
type Mutation {
    postPhoto(name: String! description: String): Photo!
}
type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
}
`;

interface IPhoto {
    id: string
    url: string
    name: string
    description: string
}

const photos: Array<IPhoto> = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },
  Mutation: {
    postPhoto(parent: any, args: any) {
      const newPhoto = {
        id: ulid(),
        ...args,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent: IPhoto) => `https://yoursite.com/img/${parent.id}.jpg`,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`));
