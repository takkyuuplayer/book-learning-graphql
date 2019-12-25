import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { ROOT_QUERY } from './App';
import { User } from '../../src/generated/graphql';
import { ApolloQueryResult } from 'apollo-boost';
import { gql } from 'apollo-boost'

interface Data {
  totalUsers: number;
  allUsers: Array<User>;
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
  <Query<Data> query={ROOT_QUERY} pollInterval={1000 * 10}>
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
const UserListItem = ({ name, avatar }: User) => (
  <li>
    <img src={avatar as string | undefined} width={48} height={48} alt="" />
    {name}
  </li>
);
export default Users;
