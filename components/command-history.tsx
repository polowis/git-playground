import { ChevronRight } from "lucide-react"

interface CommandHistoryProps {
  commands: string[]
}

export default function CommandHistory({ commands }: CommandHistoryProps) {
  if (commands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p>No commands executed yet</p>
        <p className="text-sm mt-2">Try running some Git commands in the terminal</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 rounded-lg p-4 h-full overflow-auto font-mono text-sm">
      <h3 className="text-zinc-400 mb-2 pb-2 border-b border-zinc-800">Command History</h3>
      <ul className="space-y-1">
        {commands.map((command, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-green-500 mr-2" />
            <span>{command}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
