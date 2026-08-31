package com.interstellar.industries;

import android.content.Context;
import android.content.SharedPreferences;

// Gemeinsamer Speicher fuer Server-URL/Token/Benachrichtigungs-Einstellung, die die
// WebView-App per JS-Bridge (MainActivity.GameBridge) hierher spiegelt - der
// NotificationPollWorker liest dieselben Werte, um auch bei geschlossener App
// periodisch nach neuen Ereignissen fragen zu koennen (die WebView-eigene
// localStorage ist aus nativem Code sonst nicht ohne Weiteres erreichbar).
final class GamePrefs {
    private static final String PREFS_NAME = "game_prefs";
    private static final String KEY_SERVER_URL = "serverUrl";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_NOTIFICATIONS_ENABLED = "notificationsEnabled";
    private static final String KEY_LAST_SEEN_MESSAGE = "lastSeenMessage";

    private GamePrefs() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    static void setCredentials(Context context, String serverUrl, String token) {
        prefs(context).edit()
                .putString(KEY_SERVER_URL, serverUrl == null ? "" : serverUrl)
                .putString(KEY_TOKEN, token == null ? "" : token)
                .apply();
    }

    static String getServerUrl(Context context) { return prefs(context).getString(KEY_SERVER_URL, ""); }
    static String getToken(Context context) { return prefs(context).getString(KEY_TOKEN, ""); }

    static void setNotificationsEnabled(Context context, boolean on) {
        prefs(context).edit().putBoolean(KEY_NOTIFICATIONS_ENABLED, on).apply();
    }
    static boolean isNotificationsEnabled(Context context) {
        return prefs(context).getBoolean(KEY_NOTIFICATIONS_ENABLED, false);
    }

    static String getLastSeenMessage(Context context) { return prefs(context).getString(KEY_LAST_SEEN_MESSAGE, null); }
    static void setLastSeenMessage(Context context, String msg) {
        prefs(context).edit().putString(KEY_LAST_SEEN_MESSAGE, msg).apply();
    }
}
