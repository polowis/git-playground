So far, you've been working in your own little turtle world on the `feature-turtle `branch — adding files, making changes, and keeping it separate from the main project. 🐢

Now, let's say your changes are ready. The turtle file is tested, polished, and you're happy with it. Time to bring those changes back into the `master` branch so everyone (and everything) else can see it too.

That’s where merging comes in.

### 🔄 Step 1: Switch to master
Before merging, make sure you're on the branch you want to merge into — in this case, that’s master.

```sh
$ git checkout master
```

---

### 🤝 Step 2: Merge the Branch
Now merge in your turtle work from `feature-turtle`:

```sh
$ git merge feature-turtle
```

If everything goes smoothly, Git will combine the two branches and show a message like:

```txt
Merged branch feature-turtle into master;
```

---

### 👀 Step 3: Check Your Files
To confirm everything is in place, check your files:

```sh
$ ls
```

You should see `turtle.txt` now in the master branch. 🎉 Your changes are officially part of the main codebase.