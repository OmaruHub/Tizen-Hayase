@echo off
title Hayase TV Host Server
echo ======================================================
echo Starting Hayase TV Host Server...
echo ======================================================
cd /d "%~dp0Hayase-app\tizen"
npm run host
pause
