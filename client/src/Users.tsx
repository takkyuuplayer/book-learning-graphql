import React from 'react';
import { Query } from 'react-apollo';
import { ROOT_QUERY } from './App';
import { User } from '../../src/generated/graphql';
const Users = () => (
  <Query query={ROOT_QUERY} pollInterval={1000 * 10}>
    {({ data, loading, refetch }: any) =>
      loading ? (
        <p>loading users...</p>
      ) : (
        <UserList
          count={data.totalUsers}
          users={data.allUsers}
          refetchUsers={refetch}
        />
      )
    }
  </Query>
);
interface UserListInput {
  count: number;
  users: Array<User>;
  refetchUsers: any 
}
const UserList = ({ count, users, refetchUsers }: UserListInput) => (
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
