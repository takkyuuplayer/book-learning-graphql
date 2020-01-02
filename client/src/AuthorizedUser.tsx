import React, { Component, useState, ComponentType } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Query, Mutation, withApollo} from 'react-apollo'
import { compose } from 'recompose'
import { gql } from 'apollo-boost'
import { ROOT_QUERY } from './App'
import { Data } from './Users'
const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`;

const Me = ({ logout, requestCode, signingIn }: any) => (
  <Query<Data> query={ROOT_QUERY}>
    {({ data, loading}) =>
      data && (data as Data).me ? (
        <CurrentUser {...(data as Data).me} logout={logout} />
      ) : loading ? (
        <p>loading users...</p>
      ) : (
        <button onClick={requestCode} disabled={signingIn}>
          Sign In with GitHub
        </button>
      )
    }
  </Query>
);

const CurrentUser = ({ name, avatar, logout }: any) => (
  <div>
    <img src={avatar} width={48} height={48} alt="" />
    <h1>{name}</h1>
    <button onClick={logout}>logout</button>
  </div>
);

//const AuthorizedUser2: React.SFC = ({
//}) => {
//  const [singingIn, setSigningIn] = useState(false);
//}

class AuthorizedUser extends Component<RouteComponentProps> {
  state = { signingIn: false };
  componentDidMount() {
    if (window.location.search.match(/code=/)) {
      this.setState({ signingIn: true });
      const code = window.location.search.replace('?code=', '');
      this.githubAuthMutation({ variables: { code } });
    }
  }
  authorizationComplete = (cache: any, { data }: any) => {
    localStorage.setItem('token', data.githubAuth.token);
    this.props.history.replace('/');
    this.setState({ signingIn: false });
  };
  requestCode() {
    var clientID = '4601eb907ae6bd3f5847';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  }
  githubAuthMutation(args: any) {}
  render() {
    return (
      <Mutation
        mutation={GITHUB_AUTH_MUTATION}
        update={this.authorizationComplete}
        refetchQueries={[{ query: ROOT_QUERY }]}
      >
        {(mutation: any) => {
          this.githubAuthMutation = mutation;
          return (
            <Me
              signingIn={this.state.signingIn}
              requestCode={this.requestCode}
              logout={async () => {
                localStorage.removeItem('token')
                let data: Data = await (this.props as any).client.readQuery({ query: ROOT_QUERY })
                await (this.props as any).client.writeQuery({ query: ROOT_QUERY, data: {...data, me: null}})
              }} />
          );
        }}
      </Mutation>
    );
  }
}
export default compose(withApollo, withRouter)(AuthorizedUser as any);
