#!/data/data/com.termux/files/usr/bin/bash
set -e

APP_URL="${1:-http://10.0.2.2:3000}"

mkdir -p android/src/com/vector/app
mkdir -p android/res/values
mkdir -p android/build/classes
mkdir -p android/build/dex
mkdir -p android/build/gen

cat > android/AndroidManifest.xml <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

<uses-permission android:name="android.permission.INTERNET"/>

<application
 android:theme="@android:style/Theme.Material.NoActionBar"
 android:label="VECTOR">

<activity
 android:name=".MainActivity"
 android:exported="true">

<intent-filter>
<action android:name="android.intent.action.MAIN"/>
<category android:name="android.intent.category.LAUNCHER"/>
</intent-filter>

</activity>

</application>

</manifest>
XML

cat > android/res/values/strings.xml <<'XML'
<resources>
<string name="app_name">VECTOR</string>
</resources>
XML

cat > android/src/com/vector/app/MainActivity.java <<JAVA
package com.vector.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        WebView web = new WebView(this);

        WebSettings settings = web.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        web.setWebViewClient(new WebViewClient());

        web.loadUrl("$APP_URL");

        setContentView(web);
    }
}
JAVA

SDK="${ANDROID_HOME:-$HOME/android-sdk}"

if [ ! -d "$SDK" ]; then
  echo "Android SDK not found."
  echo "Set ANDROID_HOME first."
  exit 1
fi

ANDROID_JAR="$SDK/platforms/android-34/android.jar"

if [ ! -f "$ANDROID_JAR" ]; then
  echo "android.jar not found at:"
  echo "$ANDROID_JAR"
  exit 1
fi

AAPT="$SDK/build-tools/34.0.0/aapt"
APKSIGNER="$SDK/build-tools/34.0.0/apksigner"
D8="$SDK/build-tools/34.0.0/d8"

if [ ! -x "$AAPT" ]; then
  AAPT="$(command -v aapt || true)"
fi

if [ ! -x "$APKSIGNER" ]; then
  APKSIGNER="$(command -v apksigner || true)"
fi

if [ ! -x "$D8" ]; then
  D8="$(command -v d8 || true)"
fi

"$AAPT" package \
  -f \
  -M android/AndroidManifest.xml \
  -S android/res \
  -I "$ANDROID_JAR" \
  -J android/build/gen \
  -F android/build/resources.ap_

javac \
  -source 8 \
  -target 8 \
  -cp "$ANDROID_JAR" \
  -d android/build/classes \
  android/src/com/vector/app/MainActivity.java \
  android/build/gen/com/vector/app/R.java

"$D8" \
  --lib "$ANDROID_JAR" \
  --output android/build/dex \
  $(find android/build/classes -name '*.class')

cp android/build/resources.ap_ VECTOR-unsigned.apk

cd android/build/dex
zip -u ../../../VECTOR-unsigned.apk classes.dex
cd ../../../

if [ ! -f debug.keystore ]; then
  keytool -genkeypair \
    -keystore debug.keystore \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=VECTOR,O=Vector's Element Tech,C=NG"
fi

"$APKSIGNER" sign \
  --ks debug.keystore \
  --ks-pass pass:android \
  --out VECTOR.apk \
  VECTOR-unsigned.apk

"$APKSIGNER" verify VECTOR.apk

echo ""
echo "======================================"
echo " VECTOR APK BUILD COMPLETE"
echo " VECTOR.apk"
echo "======================================"
