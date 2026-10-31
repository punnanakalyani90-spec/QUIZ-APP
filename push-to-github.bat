@echo off
title Push QuizSphere to GitHub
cd /d "%~dp0"

echo =======================================================
echo 🚀 Push QuizSphere to GitHub (Replace Zip with Clean Code)
echo =======================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not found in PATH!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b
)

:: GitHub Repository URL (pre-configured for your repository)
set DEFAULT_URL=https://github.com/punnanakalyani90-spec/Quiz-app.git
echo.
echo Default repository: %DEFAULT_URL%
set /p REPO_INPUT="Press ENTER to use this URL (or paste another one): "

if "%REPO_INPUT%"=="" (
    set REPO_URL=%DEFAULT_URL%
) else (
    set REPO_URL=%REPO_INPUT%
)

echo.
echo 📁 Working directory: %~dp0
echo.
echo 1. Initializing local Git repository...
if not exist ".git" (
    git init
)

echo.
echo 2. Staging extracted project folders (frontend, backend, database)...
git add .

echo.
echo 3. Creating commit...
git commit -m "Replace zip with extracted project: frontend, backend, database" 2>nul
if %errorlevel% neq 0 (
    echo Code already committed locally.
)

echo.
echo 4. Setting default branch to main...
git branch -M main

echo.
echo 5. Linking remote repository (%REPO_URL%)...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo 6. Pushing to GitHub (overwriting old zip file)...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo 🎉 SUCCESS! Your GitHub repository has been updated!
    echo All zip files have been replaced with:
    echo   📁 frontend/
    echo   📁 backend/
    echo   📁 database/
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo [ERROR] Push failed.
    echo 1. Make sure the GitHub repository URL is correct.
    echo 2. Sign in if prompted by GitHub Credential Manager.
    echo =======================================================
)

pause
