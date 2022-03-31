import type { Octokit } from "octokit";
import { GitStorage } from "./git-storage";
import { GitHubSearch } from "./github-search";

export class Repo {
  private cache: object = {};

  readonly path: string; // Repo path e.i username/repo_name
  readonly owner: string;
  readonly name: string;
  readonly mainBranch: string;

  public api: Octokit;
  public search: GitHubSearch;
  public gitStorage: GitStorage;
  public baseSha: string = "";

  constructor(path: string, mainBranch: string, api: Octokit) {
    this.path = path;
    this.owner = path.split("/")[0];
    this.name = path.split("/")[1];
    this.api = api;
    this.mainBranch = mainBranch;
    
    this.search = new GitHubSearch(this);
    this.gitStorage = new GitStorage(this);

    // There could be issues if this is not ready when the value is used. Becareful of this.
    api.rest.git.getRef({
      owner: this.owner, repo: this.name, ref: `heads/${this.mainBranch}`
    }).then(response => {
      this.baseSha = response.data.object.sha;
    });
  }

  public async analyze() {
    await this.search.search();

    return;
  }
}
