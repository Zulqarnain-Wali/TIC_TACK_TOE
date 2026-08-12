@echo off
title One-Click Push
echo =============================================
echo  Pushing to TIC_TACK_TOE
echo  Repo: https://github.com/Zulqarnain-Wali/TIC_TACK_TOE.git
echo =============================================
echo.

:: 1. If no .git folder, init and add remote
if not exist ".git" (
    echo [SETUP] Initializing Git repo...
    git init
    git remote add origin https://github.com/Zulqarnain-Wali/TIC_TACK_TOE.git
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

:: 6. ALWAYS push to MAIN (hardcoded)
set branch=main


:: 7. Push (first time uses -u)
echo [PUSH] Pushing to origin/%branch% ...
git push origin %branch% 2>nul
if errorlevel 1 (
    echo [PUSH] First push? Setting upstream...
    git push -u origin %branch%
)

echo.
echo [DONE] All done!
pause