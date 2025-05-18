"use client"

import { dir } from "@/lib/git-commands"
import * as git from "isomorphic-git";
import { getVisualizationData, VisualizationData } from "@/lib/graph"
import { useEffect, useRef, useState } from "react"

export default function GitVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visualData, setVisualData] = useState<VisualizationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getVisualizationData(dir)
        setVisualData(data)
        setError(null)
      } catch (err) {
        setError("Failed to load Git data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up polling to refresh data
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || isLoading || !visualData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
        const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    //canvas.style.width = rect.width + "px";
    //canvas.style.height = rect.height + "px";

    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear canvas
    ctx.fillStyle = "#18181b" // zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (visualData.commits.length === 0) {
      // Draw message if no commits
      ctx.fillStyle = "#71717a" // zinc-500
      ctx.font = "16px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("No commits yet", canvas.width / 2, canvas.height / 2)
      ctx.font = "14px system-ui"
      ctx.fillText(
        "Use 'git add' and 'git commit' to create your first commit",
        canvas.width / 2,
        canvas.height / 2 + 30,
      )
      return
    }

    // Draw commits and branches
    drawGitGraph(ctx, canvas.width, canvas.height, visualData)
  }, [visualData, isLoading])

  if (error) {
    return (
      <div className="h-full w-full bg-zinc-950 rounded-lg flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="text-sm mt-2">Check console for details</p>
        </div>
      </div>
    )
  }

  if (isLoading && !visualData) {
    return (
      <div className="h-full w-full bg-zinc-950 rounded-lg flex items-center justify-center">
        <div className="text-zinc-400 text-center">
          <p>Loading Git data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-zinc-950 rounded-lg overflow-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

function drawGitGraph(ctx: CanvasRenderingContext2D, width: number, height: number, data: VisualizationData) {
  const { commits, branches, branchHeads, currentBranch } = data

  if (commits.length === 0) {
    return
  }

  // Calculate positions
  const commitRadius = 10
  const commitSpacing = 60
  const branchSpacing = 40
  const startY = 50
  const startX = width / 2

  // Map to store commit positions
  const commitPositions = new Map<string, { x: number; y: number }>()

  // Calculate branch positions (x-coordinates)
  const branchPositions = new Map<string, number>()

  branches.forEach((branch: string, index: number) => {
    const offset = (index - (branches.length - 1) / 2) * branchSpacing
    branchPositions.set(branch, startX + offset)
  })

  // Position commits
  commits.forEach((commit: git.ReadCommitResult, index: number) => {
    const y = startY + index * commitSpacing

    // Find which branch this commit belongs to
    let branchName = ""
    for (const [branch, oid] of Object.entries(branchHeads)) {
      if (oid === commit.oid) {
        branchName = branch as string
        break
      }
    }

    // If commit is on a branch, use that branch's x position
    const x = branchName ? branchPositions.get(branchName) || startX : startX

    commitPositions.set(commit.oid, { x: x / 2, y })
  })

  // Draw connections between commits
  commits.forEach((commit: git.ReadCommitResult, index: number) => {
    if (index < commits.length - 1) {
      const currentCommit = commit
      const parentCommit = commits[index + 1]

      const start = commitPositions.get(currentCommit.oid)
      const end = commitPositions.get(parentCommit.oid)

      if (start && end) {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = "#52525b" // zinc-600
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  })

  // Draw commits
  commits.forEach((commit: git.ReadCommitResult) => {
    const pos = commitPositions.get(commit.oid)
    if (!pos) return

    // Draw commit circle
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, commitRadius, 0, Math.PI * 2)

    // Highlight current HEAD
    const isHead = Object.values(branchHeads).includes(commit.oid) && branchHeads[currentBranch] === commit.oid

    if (isHead) {
      ctx.fillStyle = "#22c55e" // green-500
      ctx.strokeStyle = "#16a34a" // green-600
    } else {
      ctx.fillStyle = "#e4e4e7" // zinc-200
      ctx.strokeStyle = "#a1a1aa" // zinc-400
    }

    ctx.fill()
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw commit message
    ctx.fillStyle = "#e4e4e7" // zinc-200
    ctx.font = "12px system-ui"
    ctx.textAlign = "left"
    ctx.fillText(commit.commit.message.split("\n")[0], pos.x + 20, pos.y + 5)

    // Draw commit hash (shortened)
    ctx.fillStyle = "#a1a1aa" // zinc-400
    ctx.font = "10px monospace"
    ctx.fillText(commit.oid.substring(0, 7), pos.x + 20, pos.y + 20)
  })

  // Draw branch labels
  for (const [branch, oid] of Object.entries(branchHeads)) {
    const pos = commitPositions.get(oid as string)
    if (!pos) continue

    // Draw branch tag
    const textWidth = ctx.measureText(branch).width
    const tagPadding = 6
    const tagHeight = 20
    const tagWidth = textWidth + tagPadding * 2
    const tagX = pos.x - tagWidth / 2
    const tagY = pos.y - 30

    // Tag background
    ctx.fillStyle = branch === "main" ? "#0891b2" : "#ca8a04" // cyan-600 : yellow-600
    ctx.beginPath()
    ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4)
    ctx.fill()

    // Tag text
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px system-ui"
    ctx.textAlign = "center"
    ctx.fillText(branch as string, pos.x, tagY + 14)

    // Draw line connecting tag to commit
    ctx.beginPath()
    ctx.moveTo(pos.x, tagY + tagHeight)
    ctx.lineTo(pos.x, pos.y - commitRadius)
    ctx.strokeStyle = branch === "main" ? "#0891b2" : "#ca8a04"
    ctx.lineWidth = 2
    ctx.stroke()
  }
}
