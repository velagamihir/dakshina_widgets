#!/usr/bin/env bash

# ==============================================================================
# Dakshina Widgets - Release APK Build Script
# ==============================================================================
# Builds the Android release APK, renames it with the project name and version,
# and copies it directly into the project root directory.
# ==============================================================================

set -euo pipefail

# Determine repository root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

cd "$ROOT_DIR"

echo "=================================================="
echo "  Dakshina Widgets - Building Release APK"
echo "=================================================="

# 1. Read project name and version from package.json
APP_NAME="dakshina_widgets"
APP_VERSION="1.0.0"

if [ -f "$ROOT_DIR/package.json" ]; then
  if command -v node >/dev/null 2>&1; then
    APP_NAME="$(node -p "require('./package.json').name || 'dakshina_widgets'")"
    APP_VERSION="$(node -p "require('./package.json').version || '1.0.0'")"
  fi
fi

OUTPUT_APK_NAME="${APP_NAME}-v${APP_VERSION}-release.apk"
OUTPUT_APK_PATH="$ROOT_DIR/$OUTPUT_APK_NAME"

echo "Project Name : $APP_NAME"
echo "Version      : $APP_VERSION"
echo "Target APK   : $OUTPUT_APK_NAME"
echo "--------------------------------------------------"

# 2. Check Java / JDK environment
if [ -z "${JAVA_HOME:-}" ]; then
  # Check if java is already in PATH
  if ! command -v java >/dev/null 2>&1; then
    # Attempt to discover standard JDK installations on Linux
    POSSIBLE_JDKS=(
      "/usr/lib/jvm/java-17-openjdk"
      "/usr/lib/jvm/java-17-openjdk-amd64"
      "/usr/lib/jvm/default-java"
      "/usr/lib/jvm/java-21-openjdk"
      "/usr/lib/jvm/java-21-openjdk-amd64"
      "$HOME/.jenv/versions"
      "$HOME/.sdkman/candidates/java/current"
    )
    for jdk in "${POSSIBLE_JDKS[@]}"; do
      if [ -d "$jdk" ] && [ -x "$jdk/bin/java" ]; then
        export JAVA_HOME="$jdk"
        export PATH="$JAVA_HOME/bin:$PATH"
        echo "Found JDK at: $JAVA_HOME"
        break
      fi
    done
  fi
fi

# 3. Check Android SDK environment
if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
  if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
    echo "Found Android SDK at: $ANDROID_HOME"
  fi
fi

# Ensure local.properties exists in android/ directory if ANDROID_HOME is set
if [ -n "${ANDROID_HOME:-}" ] && [ ! -f "$ROOT_DIR/android/local.properties" ]; then
  echo "sdk.dir=$ANDROID_HOME" > "$ROOT_DIR/android/local.properties"
  echo "Generated android/local.properties with sdk.dir=$ANDROID_HOME"
fi

# 4. Navigate to android directory and build release APK
echo ""
echo "Running Gradle assembleRelease..."
cd "$ROOT_DIR/android"

# Run gradle wrapper
./gradlew clean assembleRelease

# 5. Locate the generated APK
BUILD_OUTPUT_DIR="$ROOT_DIR/android/app/build/outputs/apk/release"
SOURCE_APK=""

if [ -f "$BUILD_OUTPUT_DIR/app-release.apk" ]; then
  SOURCE_APK="$BUILD_OUTPUT_DIR/app-release.apk"
elif [ -f "$BUILD_OUTPUT_DIR/app-release-unsigned.apk" ]; then
  SOURCE_APK="$BUILD_OUTPUT_DIR/app-release-unsigned.apk"
else
  # Search for any .apk in release folder
  SOURCE_APK="$(find "$BUILD_OUTPUT_DIR" -maxdepth 1 -name "*.apk" | head -n 1 || true)"
fi

if [ -z "$SOURCE_APK" ] || [ ! -f "$SOURCE_APK" ]; then
  echo "Error: Release APK not found in $BUILD_OUTPUT_DIR" >&2
  exit 1
fi

# 6. Copy and rename APK to root directory
cp "$SOURCE_APK" "$OUTPUT_APK_PATH"

# Also create/update a generic symlink or copy for convenience
cp "$SOURCE_APK" "$ROOT_DIR/${APP_NAME}-release.apk"

echo ""
echo "=================================================="
echo "  Build Successful!"
echo "=================================================="
echo "Release APK generated and copied to:"
echo "  -> $OUTPUT_APK_PATH"
echo "  -> $ROOT_DIR/${APP_NAME}-release.apk"
echo ""
ls -lh "$OUTPUT_APK_PATH"
if command -v sha256sum >/dev/null 2>&1; then
  echo ""
  echo "SHA256 Checksum:"
  sha256sum "$OUTPUT_APK_PATH"
fi
echo "=================================================="
