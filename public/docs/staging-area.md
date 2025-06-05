Git uses a two-step process to save your changes. First, you stage them. Then, you commit them.


### Let's start by creating a new file

Use the terminal to create a new file called `alice.txt` in the root of your project folder:

```sh
$ touch alice.txt
```

> 💡 Touch is a UNIX command that creates an empty file if it doesn’t already exist.
It’s handy for quickly setting up files from the command line.

### ✍️ Add Some Content to the File

Let’s add a line of text to `alice.txt` using the `echo` command:

```sh
$ echo "Hello Git!" > alice.txt
```

>💡 echo is a UNIX command that prints text to the terminal or writes it to a file.
The > symbol means "redirect the output" — so instead of printing it, you're saving it into the file.


### ✅ Stage Your Changes with git add

Git uses a two-step process to save your changes:

- Staging (with `git add`)
- Committing (with `git commit`)

Before Git can save your changes in history, you have to stage them — kind of like saying, "Hey Git, I want to include these changes in the next save." Let’s do that now.

Let's add your new file to the staging area

```sh
$ git add alice.txt
```

### 🔍 Check What’s Staged
Want to double-check what Git is about to commit? Run:

```sh
$ git status
```