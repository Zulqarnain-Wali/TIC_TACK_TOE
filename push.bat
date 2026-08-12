@echo off
title One-Click Push to main
setlocal enabledelayedexpansion

:: ---- EDIT THIS IF YOUR REPO CHANGES ----
set REPO_URL=https://github.com/Zulqarnain-Wali/TIC_TACK_TOE.git
:: ----------------------------------------

echo ============================================================
echo  Pushing to TIC_TACK_TOE (main branch)
echo  Repo: %REPO_URL%
echo ============================================================
echo.

:: 1. If no .git folder, init and add remote
if not exist ".git" (
    echo [SETUP] Initializing Git repo...
    git init
    git remote add origin %REPO_URL%
    echo [SETUP] Remote added.
)

:: 2. Stage EVERYTHING (new, modified, deleted)
echo [STAGE] Adding all files...
git add -A

:: 3. Check if anything is staged for commit
git diff --cached --quiet
if not errorlevel 1 (
    echo [INFO] No changes to commit. Everything is up to date.
    pause
    exit /b 0
)

:: 4. Ask for commit message
set /p msg="[INPUT] Commit message: "
if "%msg%"=="" (
    echo [ERROR] Message cannot be empty.
    pause
    exit /b 1
)

:: 5. Commit
echo [COMMIT] Committing...
git commit -m "%msg%"

:: 6. Push current branch (whatever it's named) to remote 'main'
echo [PUSH] Pushing to origin/main (using HEAD:main)...
git push -u origin HEAD:main

if errorlevel 1 (
    echo [ERROR] Push failed. Check your internet or credentials.
) else (
    echo [SUCCESS] Push completed! Your local branch is now tracking origin/main.
)

pause