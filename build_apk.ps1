$ProgressPreference = 'SilentlyContinue'

Write-Host "========================================================="
Write-Host "       EmmE Calculator APK Local Compilation Script"
Write-Host "========================================================="

# Check if JDK is already downloaded/extracted to save time
if (-not (Test-Path "jdk-temp")) {
    Write-Host "1. Downloading Microsoft OpenJDK 17 (Portable ZIP)..."
    curl.exe -L "https://aka.ms/download-jdk/microsoft-jdk-17-windows-x64.zip" -o "jdk.zip"

    Write-Host "2. Extracting ZIP to jdk-temp..."
    New-Item -ItemType Directory -Force -Path "jdk-temp"
    Expand-Archive -Path "jdk.zip" -DestinationPath "jdk-temp" -Force
    Remove-Item "jdk.zip" -Force
} else {
    Write-Host "JDK already extracted. Skipping download..."
}

# Find the exact JDK directory name inside the temp folder
$jdkFolder = Get-ChildItem -Path "jdk-temp" -Directory | Select-Object -First 1
$jdkPath = $jdkFolder.FullName

Write-Host "Located JDK path: $jdkPath"

# Inject JDK into environment paths temporarily
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;" + $env:PATH

Write-Host "3. Compiling Android App using Gradle Wrapper..."
cd emmecalculator-android
./gradlew.bat assembleDebug

cd ..
Write-Host "========================================================="
Write-Host "                   BUILD SUCCESSFUL!"
Write-Host "========================================================="
