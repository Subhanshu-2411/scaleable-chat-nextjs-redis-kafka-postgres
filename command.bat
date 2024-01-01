@echo off

cd "D:\Users\subha\WebstormProjects\Piyush_Garg\scaleable-chat-nextjs-redis"

git add .
git commit -m "%~1"
git push
git checkout main
git merge working
git push
git checkout working

pause