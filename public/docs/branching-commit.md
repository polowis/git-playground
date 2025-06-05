Let's try something fun — and useful — that shows just how powerful branches really are.

You're currently on your new branch (`feature-turtle`). Let’s make a change, save it, and then switch back to the `master` branch. You'll see that your change magically disappears — not because it's lost, but because it's safely tucked away in the branch where you made it.

---

### 📁 Create a New File
While on your feature-turtle branch, create a new file called `turtle.txt`:

``` sh
$ echo "This is a turtle-exclusive file." > turtle.txt
```

### Stage and commit your changes

You write something turtle-y in there, **stage** the changes, and **commit** them. All business as usual.

>  🧠 Remember how to stage and commit?
If it's a little fuzzy, no worries — scroll up to review, or ask for help if you're stuck. That's what learning looks like!

---

### 🔄 Switch Back to master
Now, let’s jump back to the `master` branch:

```sh
$ git checkout master
```

And check your files using `File Tree` or running `ls` command in the terminal:

```sh
$ ls
```
Whoa — `turtle.txt` is gone! 🫢

But don't worry — it's not deleted. It just doesn't exist in the master branch. It's part of the `feature-turtle` branch, and Git only shows you files that belong to the branch you're on.

> 💡 Git branches are like separate timelines. Changes made in one branch stay there — until you decide to bring them over.

---

### 🔁 See It Again
Want your file back? Just hop back into the `feature-turtle` branch:

```sh
$ git checkout feature-turtle
```

And just like that — `turtle.txt` reappears, safe and sound. 🐢