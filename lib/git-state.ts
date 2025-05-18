export interface Commit {
  hash: string
  message: string
  parent: string | null
  timestamp: number
}

export interface GitState {
  initialized: boolean
  workingDirectory: Record<string, string>
  stagingArea: Record<string, string>
  commits: Commit[]
  branches: Record<string, string> // branch name -> commit hash
  HEAD: string // commit hash
}

export const initialGitState: GitState = {
  initialized: false,
  workingDirectory: {},
  stagingArea: {},
  commits: [],
  branches: {},
  HEAD: "",
}

// Generate a simple hash for commits
export function generateHash(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}


// index
export const FILEPATH = 0;
export const HEAD = 1;
export const WORKDIR = 2;
export const STAGE = 3;

// Status Matrix State
export const UNCHANGED = 1;