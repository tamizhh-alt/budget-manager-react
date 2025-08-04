const { execSync } = require("child_process");

const getCommitHashes = () =>
  execSync("git rev-list --reverse HEAD").toString().trim().split("\n");

const startDate = new Date("2025-07-01");
const endDate = new Date("2025-07-29");

const randomDate = () =>
  new Date(startDate.getTime() + Math.random() * (endDate - startDate));

const formatDate = (date) => date.toISOString();

const commits = getCommitHashes();

commits.forEach((hash, i) => {
  const newDate = formatDate(randomDate());
  console.log(`Rewriting ${hash} to ${newDate}`);

  execSync(
    `GIT_COMMITTER_DATE="${newDate}" git commit --amend --no-edit --date="${newDate}" --allow-empty`,
    { stdio: "inherit" }
  );

  if (i < commits.length - 1)
    execSync(`git rebase --continue`, { stdio: "inherit" });
});
