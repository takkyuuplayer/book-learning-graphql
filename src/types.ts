import { Db } from 'mongodb';

export interface IContext {
  db: Db;
  currentUser: IUser;
}

export interface IUser {
  githubLogin: string;
  name: String;
  avatar: String;
}

export interface IPhoto {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  userID: string;
  created: string;
}
