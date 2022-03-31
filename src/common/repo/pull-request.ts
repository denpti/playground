import type { Repo } from ".";

export class PullRequest {
  private repo: Repo;
  private cache: object = {};

  constructor(repo: Repo){
    this.repo = repo;
  }
}
