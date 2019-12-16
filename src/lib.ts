import axios from 'axios';

const requestGithubToken = (credentials: any) =>
  axios
    .post('https://github.com/login/oauth/access_token', credentials, {
      headers: {
        'Context-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    .then(res => res.data)
    .catch(err => {
      throw new Error(JSON.stringify(err));
    });

const requestGithubUserAccount = (token: string) =>
  axios
    .get(`https://api.github.com/user?access_token=${token}`)
    .then(res => res.data)
    .catch(err => {
      throw new Error(JSON.stringify(err));
    });

export const authorizeWithGithub = async (credentials: any) => {
  const { access_token: accessToken } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(accessToken);

  return { ...githubUser, accessToken };
};
