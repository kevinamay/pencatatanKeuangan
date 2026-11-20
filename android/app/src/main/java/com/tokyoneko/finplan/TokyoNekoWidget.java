package com.tokyoneko.finplan;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TokyoNekoWidget extends AppWidgetProvider {

    private static final String FIREBASE_URL = "https://keuangan-40058-default-rtdb.asia-southeast1.firebasedatabase.app/keuangan.json";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tokyo_neko);

        // Header Date: e.g. "Today · 20 Nov"
        SimpleDateFormat sdf = new SimpleDateFormat("d MMM", new Locale("id", "ID"));
        String dateStr = "Today · " + sdf.format(new Date());
        views.setTextViewText(R.id.txtHeaderDate, dateStr);

        // Set PendingIntents on clicks:
        // 1. Click entire widget -> opens full app
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent piOpenApp = PendingIntent.getActivity(context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widgetContainer, piOpenApp);
        views.setOnClickPendingIntent(R.id.btnOpenApp, piOpenApp);

        // 2. Click + Belanja -> opens app directly to quick add expense modal
        Intent expenseIntent = new Intent(context, MainActivity.class);
        expenseIntent.setData(Uri.parse("https://keuangan-app-jade-eta.vercel.app/?action=expense"));
        PendingIntent piExpense = PendingIntent.getActivity(context, 1, expenseIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.btnQuickExpense, piExpense);

        // 3. Click + Gaji -> opens app directly to quick add income modal
        Intent incomeIntent = new Intent(context, MainActivity.class);
        incomeIntent.setData(Uri.parse("https://keuangan-app-jade-eta.vercel.app/?action=income"));
        PendingIntent piIncome = PendingIntent.getActivity(context, 2, incomeIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.btnQuickIncome, piIncome);

        // Fetch Realtime Firebase data in background
        executor.execute(() -> {
            try {
                URL url = new URL(FIREBASE_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();

                    String jsonStr = sb.toString();
                    if (!jsonStr.equals("null") && !jsonStr.isEmpty()) {
                        JSONObject root = new JSONObject(jsonStr);

                        long totalIncome = sumCategory(root.optJSONObject("incomes"));
                        long totalExpense = sumCategory(root.optJSONObject("expenses"));
                        long totalSavings = sumCategory(root.optJSONObject("savings"));
                        long remainingSalary = totalIncome - totalExpense - totalSavings;

                        int score = 100;
                        if (remainingSalary < 0 && totalIncome > 0) {
                            score = Math.max(20, (int)(100 - (Math.abs(remainingSalary) * 100 / totalIncome)));
                        } else if (totalIncome == 0) {
                            score = 88;
                        }

                        final String remText = formatRupiah(remainingSalary);
                        final String expText = formatRupiah(totalExpense);
                        final String savText = formatRupiah(totalSavings);
                        final String scoreText = String.valueOf(score);
                        final String statusText = remainingSalary > 0 ? "Surplus ↑" : (remainingSalary < 0 ? "Defisit" : "Seimbang");

                        mainHandler.post(() -> {
                            views.setTextViewText(R.id.txtRemainingSalary, remText);
                            views.setTextViewText(R.id.txtTotalExpense, expText);
                            views.setTextViewText(R.id.txtTotalSavings, savText);
                            views.setTextViewText(R.id.txtHealthScore, scoreText);
                            views.setTextViewText(R.id.txtRemainingStatus, statusText);
                            appWidgetManager.updateAppWidget(appWidgetId, views);
                        });
                        return;
                    }
                }
            } catch (Exception ignored) {
            }

            // Fallback UI update
            mainHandler.post(() -> {
                appWidgetManager.updateAppWidget(appWidgetId, views);
            });
        });

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static long sumCategory(JSONObject obj) {
        if (obj == null) return 0;
        long total = 0;
        try {
            Iterator<String> keys = obj.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                JSONObject item = obj.optJSONObject(key);
                if (item != null) {
                    total += item.optLong("amount", 0);
                }
            }
        } catch (Exception ignored) {
        }
        return total;
    }

    private static String formatRupiah(long amount) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("id", "ID"));
        symbols.setGroupingSeparator('.');
        symbols.setCurrencySymbol("Rp ");
        DecimalFormat df = new DecimalFormat("Rp #,###", symbols);
        if (amount == 0) return "Rp 0";
        return df.format(amount);
    }
}
