// TODO

/**
 * Simulate fetch from remote origin
 * No actual remote URL needed
 * TODO get current branch
 */
export async function gitFetch(): Promise<string> {
  return `
From origin
 * branch            main       -> FETCH_HEAD
   1a2b3c4..5d6e7f8  main       -> origin/main
`.trim();
}
