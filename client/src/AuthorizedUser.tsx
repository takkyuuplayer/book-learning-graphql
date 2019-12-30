import React, { Component, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Mutation, useMutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { ROOT_QUERY } from './App'
import { AuthPayload, MutationGithubAuthArgs } from '../../src/generated/graphql'
const GITHUB_AUTH_MUTATION = gql`
mutation githubAuth($code:String!) {
githubAuth(code:$code) { token }
}
`
class AuthorizedUser extends Component<RouteComponentProps> {
  state = { signingIn: false };
  componentDidMount() {
    if (window.location.search.match(/code=/)) {
      this.setState({ signingIn: true });
      const code = window.location.search.replace('?code=', '');
      this.githubAuthMutation({ variables: {code} })
    }
  }
  authorizationComplete = (cache: any, { data }: any) => {
    localStorage.setItem('token', data.githubAuth.token);
    this.props.history.replace('/');
    this.setState({ signingIn: false });
  }
  requestCode() {
    var clientID = '4601eb907ae6bd3f5847';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  }
  githubAuthMutation(args: any) {
  }
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
            <button onClick={this.requestCode} disabled={this.state.signingIn}>
              Sign In with GitHub
            </button>
          );
        }}
      </Mutation>
    );
  }
}
export default withRouter(AuthorizedUser);
