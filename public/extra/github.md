# 🐙 GitHub Activity: Pull Request
This activity will walk you through:

🔹 Cloning a repository

🔹 Adding files

🔹 Committing and pushing changes

🔹 Opening a pull request


By the end of this activity, each of you will have created your own JSON file, submitted it through a pull request, and seen your contribution merged into the main branch. Thanks to the GitHub Actions CI/CD pipeline, your changes will automatically update the live website.

---

### ⚙️ Prerequisites
Make sure you have:

- A GitHub account
- Git installed on your computer
- A text editor (like VS Code) or if you’re comfortable with the command line and don’t need a GUI, that works too!

> ⚠️ Remember: For this activity, please switch to your local Git setup on your computer.
You can keep this instruction tab open for reference.
The sandbox app does not support remote Git features like cloning or pushing.

####  🚨 Important: Use Your Invited GitHub Username
Before you start, please confirm you are logged into GitHub with the username invited to this repository.
Why?

- So you have permission to clone and push branches

- So your commits and pull requests link correctly to your GitHub profile


---


### 1. 🧩 Clone the Repository

#### Option A: Clone via Command Line
Open your terminal or command prompt and run:

```bash
$ git clone https://github.com/Innovation-Central-Canberra/working-git-example.git
$ cd working-git-example
```
> 🔐 Note about HTTPS cloning:
When using HTTPS URLs, GitHub requires a personal access token (PAT) instead of your password for authentication.
You'll need to generate a token in your GitHub account settings and use it as your password when prompted.

Or clone using SSH:

```bash
$ git clone git@github.com:Innovation-Central-Canberra/working-git-example.git
```

> Make sure to follow GitHub’s instructions for authenticating with SSH. Or use Option B below.

#### Option B: Clone via GitHub Desktop (If you prefer using a GUI)
- Open Github Repo link.
- Click Code -> Open with Github Desktop.

> **If you have trouble with authentication when cloning, [see troubleshooting](#troubleshooting)**
---


### 2️. 🌿 Create a New Branch
Always create a new branch to work on your feature, so the main branch stays clean.


```bash
git checkout -b add-json-username
```
> Example: add-json-johnsmith

---

### 📄 3. Add Your JSON File
- Go to the `contributions/` folder inside the project
- Create a JSON file named after you — no spaces in the filename! (e.g `johnsmith.json`)
- Add your info inside the file

Here’s an example JSON file:

```json
{
  "name": "John Smith",
  "studentId": "u12345678",
  "degree": "Software Engineering",
  "year": "4th Year",
  "githubUsername": "johnsmith",
  "favouriteTools": ["MATLAB", "Python", "Inkscape"],
  "projects": ["Traffic Sign Recognition for Autonomous Vehicles"]
}
```

Create your own file like this!

- **name**: Your name
- **studentId**: Your student ID number
- **degree**: What degree or program you’re studying (e.g., Software Engineering)
- **year**: Your current year or level of study (e.g., 4th Year, Level 3)
- **githubUsername**: Your GitHub username (if you have one)
- **favouriteTools**: List any tools, languages, or software you like to use (examples: Python, Figma, Excel, Photoshop, Blender)
- **projects**: List any projects you're working on

Remember to keep the format exactly as shown, with commas, quotes, and brackets — this keeps your JSON valid!

---

### 📌 4. Commit your changes

Just like you practiced, stage and commit your new file:

```sh
git add contributions/johnsmith.json
git commit -m "Add JSON data for John Smith"
```

---

### 🚀 5. Push your branch to Github
```sh
git push origin add-json-username
```

> 💡 `git push` uploads your changes to the remote repository on GitHub — so others (and your instructor) can see your work.
>
> 💡 The first time you push your branch, use:
`git push origin your-branch`
Next time, if you make more changes, just run:
`git push`
Git will know where to send your updates automatically.

---

### 🔀 6. Create a Pull Request on GitHub
- Open the repository on GitHub in your browser

- Click the **Compare & pull request** button that appears for your branch

- Add a clear title and description of your changes

- Submit the PR
  
> 🧪 A GitHub Action will automatically validate your JSON.
> 
> ❌ If there's a formatting error, you'll see a red ❌ check — fix your file and push again.
> 
> ✅ If everything looks good, you'll see a green ✅ and your PR is ready for review.

---

### 🔎 7. Review & Merge

After merging, the website will automatically update to include your JSON data.



### Troubleshooting

If you have trouble pushing your code due to Github Authentication. Follow instruction below. 

If you use **HTTPS**:

1. In the upper-right corner of any page on GitHub, click your profile photo, then click  Settings.

2. In the left sidebar, click  Developer settings.

3. In the left sidebar, under  Personal access tokens, click Fine-grained tokens.

4. Click Generate new token.

5. Under `Token name`, enter a name for the token.

6. Under `Expiration`, select an expiration for the token

7. Under `Resource owner`, select a resource owner. In this case choose ICC

8. Under `Repository access`, select which repositories you want the token to access. Choose the name of this repo `working-git-example`.
9. Under Permissions, select which permissions to grant the token. In this case under `Content`, select `read & write` to make sure you have both read & write permission

![git image](/images/token.png)

If you use **SSH**:

1. Generate an SSH key pair on your local machine (if you don’t already have one):

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Add your public SSH key to your GitHub account:

Copy your public key (usually ~/.ssh/id_ed25519.pub).

Go to GitHub → Settings → SSH and GPG keys → New SSH key → Paste your key and save.

3. Make sure your SSH agent is running and the private key is loaded (usually automatic on most OSes).