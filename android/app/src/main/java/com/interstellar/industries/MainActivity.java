package com.interstellar.industries;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

public class MainActivity extends Activity {

    private static final int REQUEST_FILE_CHOOSER = 51;
    private static final int REQUEST_LOAD_SAVE = 52;
    private static final String POLL_WORK_NAME = "notification_poll";

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        NotificationHelper.createChannel(this);
        requestNotificationPermissionIfNeeded();

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                filePathCallback = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                try {
                    startActivityForResult(Intent.createChooser(intent, "Spielstand wählen"), REQUEST_FILE_CHOOSER);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });
        webView.addJavascriptInterface(new GameBridge(), "Android");

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private class GameBridge {
        @JavascriptInterface
        public void saveGame(final String json) {
            runOnUiThread(() -> writeSaveFile(json));
        }

        @JavascriptInterface
        public void loadGame() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                try {
                    startActivityForResult(Intent.createChooser(intent, "Spielstand wählen"), REQUEST_LOAD_SAVE);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Kein Dateimanager gefunden", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Vom Client aufgerufen, wenn im Ereignisprotokoll ein neuer angriffs-/verteidigungs-
        // relevanter Eintrag auftaucht (siehe checkForNotifiableEvents() in app.js). Nutzt die
        // native Android-Benachrichtigung statt der Web Notifications API, da eine normale
        // WebView diese ohne zusaetzliche JS-Bridge nicht implementiert.
        @JavascriptInterface
        public void showNotification(final String title, final String body) {
            runOnUiThread(() -> NotificationHelper.post(MainActivity.this, title, body));
        }

        // Spiegelt Server-URL+Token in SharedPreferences (siehe GamePrefs), damit der
        // periodische NotificationPollWorker auch bei geschlossener App darauf zugreifen kann -
        // die WebView-eigene localStorage ist aus nativem Code sonst nicht erreichbar. Ein
        // leerer Token (Logout) stoppt den Hintergrunddienst wieder.
        @JavascriptInterface
        public void storeCredentials(final String serverUrl, final String token) {
            runOnUiThread(() -> {
                GamePrefs.setCredentials(MainActivity.this, serverUrl, token);
                if (serverUrl != null && !serverUrl.isEmpty() && token != null && !token.isEmpty()) {
                    schedulePollWork();
                } else {
                    WorkManager.getInstance(MainActivity.this).cancelUniqueWork(POLL_WORK_NAME);
                }
            });
        }

        // Spiegelt die Benachrichtigungs-Einstellung aus den Client-Einstellungen (siehe
        // setNotificationsEnabled() in app.js), damit der Hintergrunddienst respektiert, wenn
        // der Nutzer Benachrichtigungen in der App wieder ausgeschaltet hat.
        @JavascriptInterface
        public void setNotificationsEnabled(final boolean on) {
            runOnUiThread(() -> GamePrefs.setNotificationsEnabled(MainActivity.this, on));
        }
    }

    // WorkManager erlaubt periodische Arbeit nur alle 15 Minuten oder seltener - das ist der
    // kuerzestmoegliche Abstand fuer diesen Hintergrund-Abgleich. KEEP sorgt dafuer, dass ein
    // bereits laufender periodischer Auftrag nicht bei jedem App-Start/Login neu getaktet wird.
    private void schedulePollWork() {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(NotificationPollWorker.class, 15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build();
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(POLL_WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request);
    }

    private void requestNotificationPermissionIfNeeded() {
        // Ab Android 13 (API 33) ist POST_NOTIFICATIONS eine gefaehrliche Laufzeit-
        // Berechtigung wie Kamera/Standort - ohne explizite Zustimmung bleibt notify()
        // sonst wirkungslos. Auf aelteren Versionen war das Recht schon durch den
        // Manifest-Eintrag automatisch erteilt.
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 60);
            }
        }
    }

    private void writeSaveFile(String json) {
        String fileName = "stellare-industrien-save.json";
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                values.put(MediaStore.Downloads.IS_PENDING, 1);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) throw new IllegalStateException("MediaStore insert fehlgeschlagen");
                try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                    if (out == null) throw new IllegalStateException("Kein OutputStream");
                    out.write(json.getBytes(StandardCharsets.UTF_8));
                }
                values.clear();
                values.put(MediaStore.Downloads.IS_PENDING, 0);
                getContentResolver().update(uri, values, null, null);
            } else {
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!dir.exists()) dir.mkdirs();
                File file = new File(dir, fileName);
                try (OutputStream out = new FileOutputStream(file)) {
                    out.write(json.getBytes(StandardCharsets.UTF_8));
                }
            }
            Toast.makeText(this, "Spielstand in Downloads gespeichert", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "Speichern fehlgeschlagen: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_FILE_CHOOSER) {
            Uri[] results = null;
            if (filePathCallback == null) return;
            if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {
                results = new Uri[]{data.getData()};
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            return;
        }
        if (requestCode == REQUEST_LOAD_SAVE) {
            if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {
                readAndDeliverSave(data.getData());
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void readAndDeliverSave(Uri uri) {
        try (InputStream is = getContentResolver().openInputStream(uri)) {
            if (is == null) throw new IllegalStateException("Datei konnte nicht geöffnet werden");
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            String b64 = Base64.encodeToString(sb.toString().getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP);
            webView.evaluateJavascript("window.applyLoadedSaveBase64 && window.applyLoadedSaveBase64('" + b64 + "')", null);
        } catch (Exception e) {
            Toast.makeText(this, "Laden fehlgeschlagen: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
