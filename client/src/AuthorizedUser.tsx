import React, { Component, useState, ComponentType, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Query, Mutation, withApollo, useMutation } from 'react-apollo';
import { MutationUpdaterFn } from 'apollo-boost';
import { compose } from 'recompose';
import { gql } from 'apollo-boost';
import { ROOT_QUERY } from './App';
import { Data } from './Users';
import { AuthPayload } from '../../src/generated/graphql';
const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`;

const Me = ({ logout, requestCode, signingIn }: any) => (
  <Query<Data> query={ROOT_QUERY}>
    {({ data, loading }) =>
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

const AuthorizedUser: React.SFC<RouteComponentProps & { client: any}> = ({ history, client }) => {
  const [signingIn, setSigningIn] = useState(false);

  const authorizationComplete: MutationUpdaterFn<{
    githubAuth: AuthPayload;
  }> = (cache, response) => {

    if(response.data) {
      localStorage.setItem('token', (response.data).githubAuth.token);
    }

    history.replace('/');
    setSigningIn(false);
  };

  const [githubAuthMutation] = useMutation<
    {githubAuth: AuthPayload}, // Response payloadof GITHUB_AUTH_MUTATION
    { code: string}  // Request Payload for GITHUB_AUTH_MUTATION
  >(GITHUB_AUTH_MUTATION, {
    update: authorizationComplete,
  });

  useEffect(() => {
    if (window.location.search.match(/code=/) && !signingIn) {
      setSigningIn(true);
      const code = window.location.search.replace('?code=', '');
      githubAuthMutation({ variables: { code } });
    }
  }); 

  function requestCode() {
    var clientID = '4601eb907ae6bd3f5847';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  }

  return (
          <Me
            signingIn={signingIn}
            requestCode={requestCode}
            logout={async () => {
              localStorage.removeItem('token');
              let data: Data = await client.readQuery({
                query: ROOT_QUERY,
              });
              await client.writeQuery({
                query: ROOT_QUERY,
                data: { ...data, me: null },
              });
            }}
          />
        );
};

export default compose(withApollo, withRouter)(AuthorizedUser as any);
