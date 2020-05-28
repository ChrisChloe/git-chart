import axios from 'axios'

const api = {
    baseUrl: 'https://api.github.com',
}

class CoreServices {

    constructor() {
        this.cancel = ''
    }

    static getUsers(data) {
        if (this.cancel) {
            this.cancel.cancel();
        }
        this.cancel = axios.CancelToken.source();

        return axios.get(
            `${api.baseUrl}/search/users?q=${data}"`,
            {cancelToken: this.cancel.token}
        )
    }

    static getRepos(url) {
        return axios.get(url)
    }

    static getIssues(user, repo) {
        return axios.get(`${api.baseUrl}/repos/${user}/${repo}/issues?state=closed&per_page=100`)
    }

    static getPullRequests(user, repo, state) {
        return axios.get(`${api.baseUrl}/repos/${user}/${repo}/pulls?state=${state}&per_page=100`)
    }

    static getSinglePR(user, repo, number) {
        return axios.get(`${api.baseUrl}/repos/${user}/${repo}/pulls/${number}`)
    }

}

export default CoreServices