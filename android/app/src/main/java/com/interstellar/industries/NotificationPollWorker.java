package com.interstellar.industries;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

// Periodischer Hintergrund-Abgleich (via WorkManager, siehe MainActivity.schedulePollWork):
// fragt /api/state ab und benachrichtigt bei neuen angriffs-/ankunftsrelevanten Eintraegen
// in state.messages - funktioniert auch, wenn die App-Activity nicht geoeffnet ist. Spiegelt
// exakt die Diff-Logik von checkForNotifiableEvents() in app.js (neueste zuerst, bis zum
// zuletzt gesehenen Eintrag durchgehen, auf Schluesselwoerter pruefen).
public class NotificationPollWorker extends Worker {

    private static final String[] NOTIFIABLE_KEYWORDS = {
            "angegriffen", "Angriffsbericht", "KATASTROPHE", "Todesstern-Bombardement",
            "Raketenangriff", "Transport von", "ausspioniert", "Spionageversuch"
    };

    public NotificationPollWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        if (!GamePrefs.isNotificationsEnabled(context)) return Result.success();
        String serverUrl = GamePrefs.getServerUrl(context);
        String token = GamePrefs.getToken(context);
        if (serverUrl.isEmpty() || token.isEmpty()) return Result.success();

        try {
            URL url = new URL(serverUrl.replaceAll("/+$", "") + "/api/state");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            int status = conn.getResponseCode();
            if (status != 200) return Result.success(); // abgelaufener Token o.ae. - naechster Versuch spaeter
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
            }
            JSONObject data = new JSONObject(sb.toString());
            JSONArray messages = data.optJSONArray("messages");
            if (messages == null || messages.length() == 0) return Result.success();

            String newest = messages.getString(0);
            String lastSeen = GamePrefs.getLastSeenMessage(context);
            GamePrefs.setLastSeenMessage(context, newest);
            // Beim allerersten Lauf (noch kein lastSeen gespeichert) nichts nachtraeglich melden -
            // sonst wuerde die komplette bestehende Nachrichtenliste einmalig aufploppen.
            if (lastSeen == null) return Result.success();

            for (int i = 0; i < messages.length(); i++) {
                String entry = messages.getString(i);
                if (entry.equals(lastSeen)) break;
                if (containsNotifiableKeyword(entry)) {
                    NotificationHelper.createChannel(context);
                    NotificationHelper.post(context, "Stellare Industrien", entry);
                }
            }
        } catch (Exception e) {
            return Result.success(); // voruebergehender Fehler (kein Netz etc.) - naechster Zyklus behebt es von selbst
        }
        return Result.success();
    }

    private static boolean containsNotifiableKeyword(String text) {
        for (String kw : NOTIFIABLE_KEYWORDS) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
