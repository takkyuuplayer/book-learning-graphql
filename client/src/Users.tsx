import React from 'react';
import { Query } from 'react-apollo';
import { ROOT_QUERY } from './App';
import { User } from '../../src/generated/graphql';
import { ApolloQueryResult } from 'apollo-boost';

interface Data {
  totalUsers: number;
  allUsers: Array<User>;
}

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