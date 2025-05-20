Sometimes we make a change and realise... "Actually, I liked it better before."
Let’s say you want to go back to the last recorded state — before you added:

```
I met an interesting turtle while the song on the radio blasted away.
```

In this case, you want to undo the changes in the file itself, not just unstage them.

---

### Restore the File with git checkout

To bring alice.txt back to how it looked in the last commit (aka the last recorded version), run:

```sh
$ git checkout -- alice.txt
```

> 💡 This replaces the current version of `alice.txt` with the version from your last commit.
> Be careful — you’ll lose any changes you made in the file since then!
