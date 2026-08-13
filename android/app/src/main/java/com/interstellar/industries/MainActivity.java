package com.interstellar.industries;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {

    private static final int REQUEST_FILE_CHOOSER = 51;
    private static final int REQUEST_LOAD_SAVE = 52;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
