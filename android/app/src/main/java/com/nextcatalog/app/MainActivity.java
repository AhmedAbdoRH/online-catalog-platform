package com.nextcatalog.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyWebViewSettings();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyWebViewSettings();
    }

    @Override
    public void onStart() {
        super.onStart();
        applyWebViewSettings();
    }

    private void applyWebViewSettings() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                WebSettings settings = webView.getSettings();
                // قفل تكبير الخط على 100% لمنع تشويه وقطع عناصر الشاشة على هواتف العملاء
                settings.setTextZoom(100);
                // تفعيل معالجة الـ Viewport المتجاوبة للشاشة بالكامل
                settings.setUseWideViewPort(true);
                settings.setLoadWithOverviewMode(true);
                settings.setSupportZoom(false);
                settings.setBuiltInZoomControls(false);
                settings.setDisplayZoomControls(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
