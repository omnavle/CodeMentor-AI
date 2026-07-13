import re
from git import Repo, GitCommandError

from services.file_service import WORKSPACE_DIR, clear_workspace


def is_valid_github_url(url: str) -> bool:
    """
    Very simple validation to check the URL looks like a public
    GitHub repository link, e.g. https://github.com/user/repo
    """
    pattern = r"^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$"
    return re.match(pattern, url.strip()) is not None


def clone_github_repo(repo_url: str):
    """
    Clones the given public GitHub repository into the workspace directory.
    Clears any previously loaded project first.
    """
    repo_url = repo_url.strip()

    if not is_valid_github_url(repo_url):
        raise ValueError(
            "Invalid GitHub URL. Expected format: https://github.com/user/repo"
        )

    # Step 1: Clear old project (ZIP or previous repo)
    clear_workspace()

    # Step 2: Clone the repo directly into WORKSPACE_DIR
    # depth=1 means "shallow clone" -> only latest commit, no history.
    # This makes cloning much faster and saves disk space.
    try:
        Repo.clone_from(repo_url, WORKSPACE_DIR, depth=1)
    except GitCommandError as e:
        raise ValueError(
            "Failed to clone repository. Make sure it's a valid, "
            f"public GitHub repo. Details: {str(e)}"
        )