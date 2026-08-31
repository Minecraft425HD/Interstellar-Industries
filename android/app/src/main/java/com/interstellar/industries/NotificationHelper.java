package com.interstellar.industries;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

// Gemeinsame Benachrichtigungs-Logik fuer MainActivity (Vordergrund, ueber die JS-Bridge
// ausgeloest) UND NotificationPollWorker (Hintergrund, ueber WorkManager periodisch
// ausgeloest) - beide sollen denselben Kanal und Aufbau verwenden, statt Code doppelt
// zu pflegen.
final class NotificationHelper {
    static final String CHANNEL_ID = "game_events";
    private static int nextNotificationId = 1001;

    private NotificationHelper() {}

    static void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Spielereignisse", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Angriffe, Flottenankünfte und andere wichtige Ereignisse");
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    @SuppressWarnings("deprecation")
    static void post(Context context, String title, String body) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT
                | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, flags);
        // Notification.Builder(Context, String) braucht API 26+ (Kanal-Pflicht); minSdk hier ist
        // 24, daher fuer aeltere Geraete auf den alten Einzel-Argument-Konstruktor ausweichen
        // (ohne Kanal - dort gibt es das Konzept noch nicht).
        Notification.Builder builder = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                ? new Notification.Builder(context, CHANNEL_ID)
                : new Notification.Builder(context);
        Notification notification = builder
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(nextNotificationId++, notification);
    }
}
