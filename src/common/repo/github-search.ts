import type { Repo } from ".";

const SearchDataObj = {
  query: "",
  count: 0,
  result: null,
}

export type SearchData = typeof SearchDataObj;

export class GitHubSearch {
  private repo: Repo;
  private searchTerms: string[] = [];
  private cache: object = {};

  constructor(repo: Repo){
    this.repo = repo;
  }

  public addSearchTerm(term: string) {
    this.searchTerms.push(term)
  }

  public addSearchTerms(terms: string[]) {
    this.searchTerms = this.searchTerms.concat(terms);
  }

  public getResultsFor(terms: string[]) : SearchData[] {
    var results: SearchData[] = [];

    terms.forEach(term => {
      if (this.cache[term]) {
        results.push({ ...SearchDataObj, ...this.cache[term]})
      }
    });

    return results;
  }

  public async search() {
    // Search github for each of the terms and report any relevant data
    return Promise.all(this.searchTerms.map(async term => {
      if (!this.cache[term]) {
        var q = `${term}+repo:${this.repo.path}`
        var response = await this.repo.api.rest.search.code({ q });

        this.cache[term] = {
          query: q,
          count: response.data.total_count,
          result: response.data
        }
      }

      return this.cache[term];
    }));
  }
}