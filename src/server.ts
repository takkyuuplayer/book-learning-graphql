import {ulid} from 'ulid';
import {ApolloServer} from 'apollo-server';
const typeDefs = `
type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
    allUsers: [User!]!
}
type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
}
type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
}
type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
}
input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
}
enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
}
`;

interface IPhoto {
    id: string
    name: string
    description: string
    category: string
    githubUser: string
}
interface IUser {
    githubLogin: string
    name: String
    avatar: String
}
interface ITag {
    photoID: string
    userID: string
}

const users = [
  {'githubLogin': 'g1', 'name': 'Alice'},
  {'githubLogin': 'g2', 'name': 'Bob'},
  {'githubLogin': 'g3', 'name': 'Charles'},
];
const photos: Array<IPhoto> = [
  {id: ulid(), name: 'p1', description: 'd1', category: 'ACTION', githubUser: 'g1'},
  {id: ulid(), name: 'p2', description: 'd2', category: 'SELFIE', githubUser: 'g2'},
  {id: ulid(), name: 'p3', description: 'd3', category: 'LANDSCAPE', githubUser: 'g2'},
];
const tags: Array<ITag> = [
  {'photoID': photos[0].id, 'userID': 'g1'},
  {'photoID': photos[1].id, 'userID': 'g1'},
  {'photoID': photos[1].id, 'userID': 'g2'},
  {'photoID': photos[1].id, 'userID': 'g3'},
];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
    allUsers: () => users,
  },
  Mutation: {
    postPhoto(parent: any, args: any) {
      const newPhoto = {
        id: ulid(),
        ...args.input,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent: IPhoto) => `https://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent: IPhoto) => users.find((u) => u.githubLogin === parent.githubUser),
    taggedUsers: (parent: IPhoto) => tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },
  User: {
    postedPhotos: (parent: IUser) => photos.filter((p) => p.githubUser === parent.githubLogin),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`));
