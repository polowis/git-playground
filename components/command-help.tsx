export default function CommandHelp() {
  return (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Git Commands</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git init</code>
            <p className="mt-1 text-zinc-400">Initialize a new Git repository</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git status</code>
            <p className="mt-1 text-zinc-400">Show the working tree status</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git add &lt;file&gt;</code>
            <p className="mt-1 text-zinc-400">Add file contents to the index</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git add .</code>
            <p className="mt-1 text-zinc-400">Add all changed files to the index</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git commit -m &quot;message&quot;</code>
            <p className="mt-1 text-zinc-400">Record changes to the repository</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git log</code>
            <p className="mt-1 text-zinc-400">Show commit logs</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git diff</code>
            <p className="mt-1 text-zinc-400">Show diff logs</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git reset</code>
            <p className="mt-1 text-zinc-400">Reset changes</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git show</code>
            <p className="mt-1 text-zinc-400">Show latest commit</p>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Branching and Merging</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git branch</code>
            <p className="mt-1 text-zinc-400">List all branches</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git branch &lt;name&gt;</code>
            <p className="mt-1 text-zinc-400">Create a new branch</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git checkout &lt;branch&gt;</code>
            <p className="mt-1 text-zinc-400">Switch to another branch</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git merge &lt;branch&gt;</code>
            <p className="mt-1 text-zinc-400">Merge specified branch into current branch</p>
          </li>

          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">git cherry-pick &lt;commit&gt;</code>
            <p className="mt-1 text-zinc-400">Pick and merge a specified commit into current branch</p>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">File Operations</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">touch &lt;filename&gt;</code>
            <p className="mt-1 text-zinc-400">Create a new file</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">echo &quot;content&quot; &gt; &lt;filename&gt;</code>
            <p className="mt-1 text-zinc-400">Create a file with content</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">cat &lt;filename&gt;</code>
            <p className="mt-1 text-zinc-400">Display file content</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">rm &lt;filename&gt;</code>
            <p className="mt-1 text-zinc-400">Remove a file</p>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Other Commands</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">help</code>
            <p className="mt-1 text-zinc-400">Show this help message</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">clear</code>
            <p className="mt-1 text-zinc-400">Clear the terminal</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">ls</code>
            <p className="mt-1 text-zinc-400">List files in the current directory</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">mkdir &lt;foldername&gt;</code>
            <p className="mt-1 text-zinc-400">Create new directory in the current directory</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">cp &lt;source&gt; &lt;dest&gt;</code>
            <p className="mt-1 text-zinc-400">Copy file content from one to another</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">cd &lt;folder&gt;</code>
            <p className="mt-1 text-zinc-400">Change working directory</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">rm &lt;file|folder&gt;</code>
            <p className="mt-1 text-zinc-400">Remove a file or folder</p>
          </li>
          <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">nano &lt;filepath&gt;</code>
            <p className="mt-1 text-zinc-400">Open nano editor</p>
          </li>
           <li>
            <code className="bg-zinc-800 px-2 py-1 rounded">echo</code>
            <p className="mt-1 text-zinc-400">Write</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
