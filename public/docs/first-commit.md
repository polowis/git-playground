Now that your file is staged, it's time to commit it — this is like saving a snapshot of your project at this moment in time.

A commit tells Git:

"These are the exact changes I want to remember."

Let’s make your first commit:

```sh
$ git commit -m "Add alice.txt with greeting"
```

> 💡 The -m flag stands for "message." You should always include a short, clear message that explains what this commit does. It helps you (and others!) understand the history of your project later.

---

### ✅ What Just Happened?
When you run `git commit`, Git takes everything you staged (with `git add`) and stores a snapshot of those changes in the repository's history.

It's like saying:

> Yes, I'm happy with this version. Let's save it.


Don't forget to check the Git graph in your interface to see your commit visually — it's a great way to understand your project's history at a glance!