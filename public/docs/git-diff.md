### 🛠️ Modify a File and See Changes with git diff

Now that you've made your first commit, let's modify a file and see what’s changed. This is where `git diff` comes in — it shows the differences between your working directory and the last commit, helping you track what’s changed before committing again.

We will also add some more content to `alice.txt` and learn how to recover from mistakes.

---

**Step 1: Modify the File**
Before we begin, a warning: this next step might be a little tricky. We’ll need to add more content to `alice.txt`.

Open `alice.txt` and type your favorite line, or use this as an example:

e.g: I met an interesting turtle while the song on the radio blasted away.

> 💡 Alternatively, you can use the UNIX command `echo` to add more content to the file. Here's an example: `$ echo "I met an interesting turtle while the song on the radio blasted away." >> alice.txt`

---

**Step 2: Save the File**
Once you've added your content, save the file.

---

**Step 3: Check the Changes**
So, what exactly did we change in the file? To see the differences, you can use the git diff command. This will show you exactly what has been modified since the last commit.

```sh
$ git diff
```

This command will output the changes you made to alice.txt, highlighting what was added, removed, or modified.

---

Our sandbox has simplified the output, but if you run this using Git on your desktop, you should see something like the following:
```
diff --git a/alice.txt b/alice.txt
index abc1234..def5678 100644
--- a/alice.txt
+++ b/alice.txt
@@ -1 +1,2 @@
 Hello, world!
+I met an interesting turtle while the song on the radio blasted away.
```

---

Now let's add `alice.txt` to the staging area. Do you remember how?

Next, check the `status` of `alice.txt` is it in the staging area now?