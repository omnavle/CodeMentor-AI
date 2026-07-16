import re
from git import Repo, GitCommandError

from services.file_service import WORKSPACE_DIR, clear_workspace


def is_valid_github_url(url):
    pattern = r"^https://github\.com/[\w.-]+/[\w.-]+(\.git)?/?$"
    return bool(re.match(pattern, url.strip()))


def clone_github_repo(repo_url):
    repo_url = repo_url.strip()

    if not is_valid_github_url(repo_url):
        raise ValueError(
            "Invalid GitHub URL. Use this format: https://github.com/user/repo"
        )

    clear_workspace()

    try:
        Repo.clone_from(repo_url, WORKSPACE_DIR, depth=1)
    except GitCommandError as e:
        raise ValueError(f"Failed to clone repository: {e}")