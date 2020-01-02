import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { ROOT_QUERY } from './App';
import { User } from '../../src/generated/graphql';
import { ApolloQueryResult, NormalizedCacheObject, MutationUpdaterFn } from 'apollo-boost';
import { gql } from 'apollo-boost'

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

const updateUserCache: MutationUpdaterFn<{addFakeUsers: Array<User>}> = (
  cache,
  response,
)  => {
  if(!response.data) {
    return
  }

  const { data: { addFakeUsers }} = response;
  let data = cache.readQuery({ query: ROOT_QUERY }) as Data;
  cache.writeQuery({
    query: ROOT_QUERY,
    data: {
      ...data,
      totalUsers: data.totalUsers + addFakeUsers.length,
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
    <Mutation<{addFakeUsers: Array<User>}>
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
