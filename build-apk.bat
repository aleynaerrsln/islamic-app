@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\aleyn\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

cd /d c:\Users\aleyn\islamic-app\android
call gradlew.bat assembleRelease

echo.
echo Build tamamlandi!
echo APK dosyasi: c:\Users\aleyn\islamic-app\android\app\build\outputs\apk\release\
pause
