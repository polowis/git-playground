

In most real-world projects, teams don't all work directly on the same version of the code at once. Instead, they use branches — kind of like separate workspaces where you can safely experiment without messing up the main project.

---


### 🔀 Live vs Development
A typical setup includes at least two main branches:

`main` (or sometimes called master): This is the `live` branch — code here is considered stable and ready for users.

`dev` (or development): This is the development branch — a space where new features, fixes, or changes are built and tested.

You can think of it like this:

`main` is what people see (like your live website).

`dev` is where the work happens (possibly messy, but full of ideas).

Changes from `dev` only get merged into `main` when everything's working as expected

---

### 🤝 Why Branching Helps Teams

Branches aren't just for organizing code — they're also super useful for teams:

Everyone can work on their own features without stepping on each other's toes.

Developers can work in parallel, fixing bugs, building features, or testing things out — all in separate branches.

When a feature is ready, it can be reviewed and merged in — clean, controlled, and with no surprises.

> 💡 Branches help teams move fast without breaking stuff. Each person gets their own safe space to code, and the main project stays stable.

---


### 🛠 Create a New Branch

Let's create a new branch to start working on a feature, without touching the main codebase:

```sh
$ git branch feature-turtle
```

> 💡 This creates a new branch called `feature-turtle`, but you're still on your current branch (master) for now.

### 🚀 Switch to Your New Branch
To actually work on that branch, you need to switch to it by using `git checkout`:

```sh
$ git checkout feature-turtle
```

Now you're in your own workspace, free to edit files, try things out, or rewrite everything turtle-related 🐢 — without affecting the rest of the project.

> The `git branch` command will list the branches you currently have