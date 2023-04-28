import { Axios } from 'axios'

export class AccountsDriver {
  private axios = new Axios({
    baseURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api`,
    responseType: 'json',
    transformRequest: data => (data ? JSON.stringify(data) : data),
    transformResponse: data => (data ? JSON.parse(data) : data),
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: status => status < 500,
  })

  static getUserCredentials(username: string) {
    return {
      email: `${username.toLowerCase()}@test.com`,
      password: 'asdaWAdji!oi8809jk',
    }
  }

  async upsert(username: string) {
    const signupResponse = await this.axios.post('accounts/signup', {
      user: AccountsDriver.getUserCredentials(username),
    })

    const accessToken = signupResponse.data.access_token
    if (!accessToken) {
      return
    }

    await this.axios.post(
      'profiles',
      {
        profile: {
          username: username,
          bio: `Me chamo ${username}`,
          image: 'https://static.productionready.io/images/smiley-cyrus.jpg',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
  }
}
