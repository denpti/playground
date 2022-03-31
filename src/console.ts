import { Octokit } from "octokit";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import yaml from 'js-yaml';


import { Repo } from "~common/repo";
import apiConfig from "~lib/api-config";
import { genWorkflows, validateRepo } from "~lib/candidate";

const RetryAndThrottleOctokit = Octokit.plugin(retry, throttling);

var octokit =  new RetryAndThrottleOctokit({
  ...apiConfig,
  throttle: {
    onRateLimit: (retryAfter, { method, url, request }) => {
      octokit.log.warn(
        `Request quota exhausted for request ${method} ${url}`
      );

      if (request.retryCount === 0) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
      return false;
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      );
    },
    onAbuseLimit: (options) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`
      );
    },
  },
  retry: {
    doNotRetry: ["429"],
  },
});

const repos: string[] = [
  "plasmo-foss/playground"
]

for (let i = 0; i < repos.length; i++) {
  const repoName: string = repos[i];
  const repo = new Repo(repoName, "main", octokit);

  genWorkflows(repo).then(response => {
    console.log("Validating: ", repoName, " result: ", validateRepo(repoName));

    console.log("Generating Workflows: ", repoName, " results: ");
    console.log(response);
    console.log("Yaml: ")

    response.forEach(async file => {
      console.log("FIle: ", file.name)
      console.log(yaml.dump(file.workflow))


      const fileTree = await repo.gitStorage.createFile(
        ".github/workflows/submit.yml", yaml.dump(file.workflow)
      );

      const branchSha = await repo.gitStorage.createBranch(`plasmo/${file.name}`, fileTree);
    // createBranch off of file name: `plasmo/${file.name}`
        // try to get branch if it exists. If it does not then create new one.
    // addFileToBranch(branchSha, path, content)
    // createPullRequestForBranch(branchSha)
      console.log("Created branch sha: ", branchSha);
    });
  });
};
