import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { ROOT_QUERY } from './App';
import { User } from '../../src/generated/graphql';
import { ApolloQueryResult, NormalizedCacheObject } from 'apollo-boost';
import { gql } from 'apollo-boost'
import { PersistedData, PersistentStorage } from 'apollo-cache-persist/types';

export type Data  = {
  totalUsers: number;
  allUsers: Array<User>;
  me: User | null;
}

const ADD_FAKE_USERS_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
      name
      avatar
    }
  }
`;
const Users = () => (
  <Query<Data> query={ROOT_QUERY} fetchPolicy="cache-and-network">
    {({ data, loading, refetch }) =>
      loading ? (
        <p>loading users...</p>
      ) : (
        <UserList
          count={(data as Data).totalUsers}
          users={(data as Data).allUsers}
          refetchUsers={refetch}
        />
      )
    }
  </Query>
);

const updateUserCache = (cache: any, { data: { addFakeUsers } }: any) => {
  let data = cache.readQuery({ query: ROOT_QUERY });
  data.totalUsers += addFakeUsers.length;
  data.allUsers = [...data.allUsers, ...addFakeUsers];
  cache.writeQuery({
    query: ROOT_QUERY,
    data: {
      ...data,
      totalUsers: data.totalUsers + addFakeUsers,
      allUsers: [...data.allUsers, ...addFakeUsers],
    },
  });
};
const UserList = ({
  count,
  users,
  refetchUsers,
}: {
  count: number;
  users: Array<User>;
  refetchUsers: () => Promise<ApolloQueryResult<Data>>;
}) => (
  <div>
    <p>{count} Users</p>
    <button onClick={() => refetchUsers()}>Refetch Users</button>
    <Mutation<User>
      mutation={ADD_FAKE_USERS_MUTATION}
      variables={{ count: 1 }}
      refetchQueries={[{ query: ROOT_QUERY }]}
      update={updateUserCache}
    >
      {addFakeUsers => <button onClick={() => addFakeUsers()}>Add Fake Users</button>}
    </Mutation>
    <ul>
      {users.map(user => (
        <UserListItem key={user.githubLogin} {...user} />
      ))}
    </ul>
  </div>
);
const UserListItem = ({ name, avatar, githubLogin }: User) => (
  <li>
    <img src={avatar as string | undefined} width={48} height={48} alt="" />
    {name}, {githubLogin}
  </li>
);
export default Users;
