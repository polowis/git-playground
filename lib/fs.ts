import FS from "@isomorphic-git/lightning-fs"

// Create a file system instance
export const pfs = new FS("gitPlaygroundFS")
export const fs = pfs.promises

const code = "const now = new Date();\n" +
"const hour = now.getHours();\n\n" +
"let greeting = '';\n" +
"if (hour < 12) {\n" +
"\tgreeting = 'Good morning';\n" +
"} else if (hour < 18) {\n" +
"\tgreeting = 'Good afternoon';\n" +
"} else {\n" +
"\tgreeting = 'Good evening';\n" +
"}\n" +
"console.log(greeting + '!');\n\n" +
"const randomNum = Math.floor(Math.random() * 100) + 1;\n" +
"console.log('Your lucky number is: ' + randomNum);\n\n" +
"function reverseString(str) {\n" +
"\treturn str.split('').reverse().join('');\n" +
"}\n" +
"const original = 'JavaScript';\n" +
"const reversed = reverseString(original);\n" +
"console.log('Reversed: ' + reversed);";

// Initialize the file system with some example files
export async function initializeFileSystem() {
  try {
    // Check if the directory exists, if not create it
    try {
      await fs.stat("/workspace")
    } catch {
      await fs.mkdir("/workspace")
    }

    // Create some example files
    await fs.writeFile("/workspace/README.md", "# Git Playground\n\nWelcome to the Git Playground!")
    await fs.writeFile("/workspace/example.js", 'console.log("Hello, Git!");\n\n' + code)
  } catch (error) {
    console.error("Error initializing file system:", error)
  }
}

export type FSEntry = {
  name: string
  stats: FS.Stats
}

// Helper function to list files in a directory
export async function listFiles(dir: string): Promise<FSEntry[]> {
  try {
    const files = await fs.readdir(dir)
    const result: FSEntry[] = []

    for (const entry of files) {
      const fullPath = dir.endsWith("/") ? dir + entry : `${dir}/${entry}`;
      const stats = await fs.stat(fullPath);

      result.push({
        name: entry,
        stats: stats
      })

    }

    return result
  } catch (error) {
    console.error(`Error listing files in ${dir}:`, error)
    return []
  }
}

// Helper function to read file content
export async function readFile(path: string): Promise<string> {
  try {
    const content = await fs.readFile(path, { encoding: "utf8" })
    return content
  } catch (error) {
    console.error(`Error reading file ${path}:`, error)
    return ""
  }
}

// Helper function to write file content
export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await fs.writeFile(path, content)
  } catch (error) {
    console.error(`Error writing file ${path}:`, error)
  }
}

// Helper function to delete a file
export async function deleteFile(path: string): Promise<void> {
  try {
    await fs.unlink(path)
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error)
  }
}
