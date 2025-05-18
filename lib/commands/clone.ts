
export async function cloneRepo(dir: string, repoUrl: string) {
  return `"Cloned ${repoUrl} to ${dir}`
  /*await git.clone({
    fs: fs,
    dir,
    http,
    corsProxy: 'https://cors.isomorphic-git.org',
    url: repoUrl,
    ref: 'master',
    singleBranch: true,
    noCheckout: false
  })*/
}