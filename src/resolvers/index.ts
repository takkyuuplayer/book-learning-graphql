import { GraphQLScalarType } from 'graphql';
import { ulid } from 'ulid';
import faker from 'faker';
import { authorizeWithGithub } from '../lib';

interface IPhoto {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  userID: string;
  created: string;
}
interface IUser {
  githubLogin: string;
  name: String;
  avatar: String;
}

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
  me: (parent: any, args: any, context: any) => {
    return context.currentUser;
  },
};
export const Mutation = {
  async postPhoto(parent: any, args: any, context: any) {
    if (!context.currentUser) {
      throw new Error('only an logged in user can post a photo');
    }
    const newPhoto = {
      ...args.input,
      userID: context.currentUser.githubLogin,
      created: new Date(),
    };
    const { insertedIds } = await context.db
      .collection('photos')
      .insert(newPhoto);
    newPhoto.id = insertedIds[0];

    return newPhoto;
  },
  async githubAuth(parent: any, args: any, context: any) {
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
    } = await context.db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    return { user, token: accessToken };
  },
  async addFakeUsers(parent: any, args: any, context: any) {
    const users = [];
    for (let i = 0; i < args.count; i++) {
      const user = {
        githubLogin: faker.internet.userName(),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        avatar: faker.image.avatar(),
        githubToken: ulid(),
      };
      users.push(user);
    }
    await context.db.collection('users').insert(users);

    return users;
  },
  async fakeUserAuth(parent: any, args: any, context: any) {
    const user = await context.db
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
export const Photo = {
  id: (parent: any) => parent.id || parent._id,
  url: (parent: IPhoto) => `https://yoursite.com/img/${parent._id}.jpg`,
  postedBy: async (parent: IPhoto, args: any, context: any) =>
    await context.db
      .collection('users')
      .findOne({ githubLogin: parent.userID }),
};
export const User = {
  postedPhotos: async (parent: IUser, args: any, context: any) =>
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
