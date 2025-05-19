### Undoing

Let’s say you added something to `alice.txt` that you’re not so sure about:

```
I met an interesting turtle while the song on the radio blasted away
```

You added it, staged it with git add, and now you're thinking... "Hmm, maybe not."

Good news: Git lets you back out before you commit. That's one of the perks of having a staging area — it gives you a safe spot to think things over.

---

### Unstage with git reset

If you staged something by mistake or just changed your mind, you can unstage it using:

```sh
$ git reset alice.txt
```

> 💡 This doesn’t delete your file or undo your changes — it just takes it out of the staging area. Think of it as telling Git, "Actually, don't include this in the next commit… for now."

---

### 🔍 Check Again with `git status`

Confirm it's no longer staged by checking the `status`
You'll see that `alice.txt` is now listed under 'Changes not staged for commit.' That means your edit is still there — it’s just not queued up to be saved yet

