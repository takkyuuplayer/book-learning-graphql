import { ulid } from 'ulid';
import { GraphQLScalarType } from 'graphql';
import { Db } from 'mongodb';

interface IPhoto {
  id: string;
  name: string;
  description: string;
  category: string;
  githubUser: string;
  created: string;
}
interface IUser {
  githubLogin: string;
  name: String;
  avatar: String;
}
interface ITag {
  photoID: string;
  userID: string;
}

const users = [
  { githubLogin: 'g1', name: 'Alice' },
  { githubLogin: 'g2', name: 'Bob' },
  { githubLogin: 'g3', name: 'Charles' },
];
const photos: Array<IPhoto> = [
  {
    id: ulid(),
    name: 'p1',
    description: 'd1',
    category: 'ACTION',
    githubUser: 'g1',
    created: '3-28-1997',
  },
  {
    id: ulid(),
    name: 'p2',
    description: 'd2',
    category: 'SELFIE',
    githubUser: 'g2',
    created: '1-2-1985',
  },
  {
    id: ulid(),
    name: 'p3',
    description: 'd3',
    category: 'LANDSCAPE',
    githubUser: 'g2',
    created: '2018-04-15T19:09:09.308Z',
  },
];
const tags: Array<ITag> = [
  { photoID: photos[0].id, userID: 'g1' },
  { photoID: photos[1].id, userID: 'g1' },
  { photoID: photos[1].id, userID: 'g2' },
  { photoID: photos[1].id, userID: 'g3' },
];

export const Query = {
  totalPhotos(parent: any, args: any, context: any) {
    return context.db.collection('photo').estimatedDocumentCount();
  },
  allPhotos: (parent: any, args: any, context: any) => {
    return context.db
      .collection('photos')
      .find()
      .toArray();
  },
  totalUsers(parent: any, args: any, context: any) {
    return context.db.collection('users').estimatedDocumentCount();
  },
  allUsers: (parent: any, args: any, context: any) => {
    return context.db
      .collection('users')
      .find()
      .toArray();
  },
};
export const Mutation = {
  postPhoto(parent: any, args: any) {
    const newPhoto = {
      id: ulid(),
      ...args.input,
      created: new Date(),
    };
    photos.push(newPhoto);
    return newPhoto;
  },
};
export const Photo = {
  url: (parent: IPhoto) => `https://yoursite.com/img/${parent.id}.jpg`,
  postedBy: (parent: IPhoto) =>
    users.find(u => u.githubLogin === parent.githubUser),
  taggedUsers: (parent: IPhoto) =>
    tags
      .filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(userID => users.find(u => u.githubLogin === userID)),
};
export const User = {
  postedPhotos: (parent: IUser) =>
    photos.filter(p => p.githubUser === parent.githubLogin),
};
export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A valid date time value.',
  parseValue: (value: string) => new Date(value),
  serialize: (value: string) => new Date(value).toISOString(),
  parseLiteral: (ast: any) => ast.value,
});
