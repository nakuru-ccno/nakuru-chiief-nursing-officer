@echo off
echo Deploying and Invoking Supabase Function...

:: Re-deploy (optional)
.\supabase.exe functions deploy send-calendar-notification

:: Manually trigger the function
.\supabase.exe functions invoke send-calendar-notification --no-verify-jwt

pause
