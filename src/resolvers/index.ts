import { GraphQLScalarType } from 'graphql';
import { ulid } from 'ulid';
import faker from 'faker';
import { authorizeWithGithub } from '../lib';
import {
  QueryResolvers,
  MutationResolvers,
  PhotoResolvers,
  UserResolvers,
} from '../generated/graphql';

export const Query: QueryResolvers = {
  totalPhotos(parent, args, { db }) {
    return db.collection('photo').estimatedDocumentCount();
  },
  allPhotos: (parent, args, { db }) => {
    return db
      .collection('photos')
      .find()
      .toArray();
  },
  totalUsers(parent, args, { db }) {
    return db.collection('users').estimatedDocumentCount();
  },
  allUsers: (parent, args, { db }) => {
    return db
      .collection('users')
      .find()
      .toArray();
  },
  me: (parent, args, { currentUser }) => {
    return currentUser;
  },
};

export const Mutation: MutationResolvers = {
  async postPhoto(parent, { input }, { db, currentUser }) {
    if (!currentUser) {
      throw new Error('only an logged in user can post a photo');
    }
    const newPhoto = {
      ...input,
      userID: currentUser.githubLogin,
      created: new Date(),
    } as any;

    const { insertedIds } = await db.collection('photos').insert(newPhoto);
    newPhoto.id = insertedIds[0];

    return newPhoto;
  },
  async githubAuth(parent, args, { db }) {
    const {
      message,
      accessToken,
      avatar_url: avatarUrl,
      login,
      name,
    } = await authorizeWithGithub({
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code: args.code,
    });

    if (message) {
      throw new Error(message);
    }
    const latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: accessToken,
      avatar: avatarUrl,
    };
    const {
      ops: [user],
    } = await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    return { user, token: accessToken };
  },
  async addFakeUsers(parent, args, { db }) {
    const users: Array<any> = [];
    for (let i = 0; i < args.count; i++) {
      const user = {
        githubLogin: faker.internet.userName(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        avatar: faker.image.avatar(),
        githubToken: ulid(),
      };
      users.push(user);
    }
    await db.collection('users').insert(users);

    return users;
  },
  async fakeUserAuth(parent, args, { db }) {
    const user = await db
      .collection('users')
      .findOne({ githubLogin: args.githubLogin });
    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${args.githubLogin}`);
    }
    return {
      token: user.githubToken,
      user,
    };
  },
};

export const Photo: PhotoResolvers = {
  id: parent => parent.id || parent._id,
  url: parent => `https://yoursite.com/img/${parent._id}.jpg`,
  postedBy: async (parent, args, { db }) =>
    await db.collection('users').findOne({ githubLogin: parent.userID }),
};

export const User: UserResolvers = {
  postedPhotos: async (parent, args, context) =>
    await context.db
      .collection('photos')
      .find({ userID: parent.githubLogin })
      .toArray(),
};
export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A valid date time value.',
  parseValue: (value: string) => new Date(value),
  serialize: (value: string) => new Date(value).toISOString(),
  parseLiteral: (ast: any) => ast.value,
});
