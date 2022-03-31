import type { Repo } from ".";

export class GitStorage {
  private repo: Repo;
  private cache: object = {};

  constructor(repo: Repo){
    this.repo = repo;
    this.cache['branch'] = {};
    this.cache['files'] = {};
  }
  
  public async createBranch(name: string, treeSha: string): Promise<string> {
    if (this.cache['branch'][name]) {
      return this.cache['branch'][name];
    }
    
    let  existingBranch = null
    await this.repo.api.rest.git.getRef({
      owner: this.repo.owner, repo: this.repo.name, ref: `heads/${name}`
    }).then(response => existingBranch = response.data.object.sha)
    .catch(_ => console.log("Branch: ", `heads/${name}`, " does not exist"));

    if(existingBranch){
      return this.cache['branch'][name] = existingBranch.data.object.sha;
    } else {
      console.log("Creating new branch: ", `heads/${name}`)
      const newBranch = await this.repo.api.rest.git.createRef({
        owner: this.repo.owner,
        repo: this.repo.name,
        ref: `refs/heads/${name}`,
        sha: treeSha
      });

      return this.cache['branch'][name] = newBranch.data.object.sha;
    }
  }

  public async createFile(path: string, content: string): Promise<string> {
    if (this.cache['files'][path]) {
      return this.cache['files'][path];
    }

    const tree = await this.repo.api.rest.git.createTree({
      owner: this.repo.owner,
      repo: this.repo.name,
      tree: [
        {
          path,
          mode: '100644',
          type: 'blob',
          content
        }
      ],
      base_tree: this.repo.baseSha
    });

    return this.cache['files'][path] = tree.data.sha;
  }
  
}
