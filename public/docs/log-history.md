We should now have a new commit. It's time to take a look at your project history. Git records each commit like a snapshot — and git log lets you scroll through those snapshots.

Too see all the commit so far use `git log`

```sh
$ git log
```

This should show all commits listed from most recent first to last recent. You should see various information like the name of the author, the date it was commited, a commit SHA number and the message of the commit

You should also see your most recent commit where you added the new file `alice.txt` in the previous step. However `git log` does not show the files involved in each commit. 

> 💡 If you only see one commit, that's okay! That's your first one. You'll see more here as you keep working.