package com.zaraxai.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Optional: Enable mixed content (for handling HTTP/HTTPS assets)
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Optional: Enable WebView debugging (helps with debugging in Chrome dev tools)
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
