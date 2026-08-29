import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Smartphone, Terminal, Layers } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose, url }) => {
  const [activeTab, setActiveTab] = useState<'kotlin' | 'xml' | 'manifest' | 'gradle'>('kotlin');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const kotlinCode = `package com.funsky.webview

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.view.WindowInsetsController
import android.webkit.*
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var offlineLayout: LinearLayout
    private lateinit var retryButton: Button

    private val targetUrl = "${url}"
    private val STORAGE_PERMISSION_CODE = 101
    private var pendingDownloadRequest: PendingDownload? = null

    data class PendingDownload(
        val url: String,
        val userAgent: String,
        val contentDisposition: String,
        val mimeType: String
    )

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Status Bar: Background #004D40 and White Icons/Text (#FFFFFF)
        window.statusBarColor = Color.parseColor("#004D40")
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.isAppearanceLightStatusBars = false // White status bar text/icons
        
        // No Toolbar / Full screen layout without ActionBar
        supportActionBar?.hide()
        setContentView(R.layout.activity_main)

        // Initialize Views
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        offlineLayout = findViewById(R.id.offlineLayout)
        retryButton = findViewById(R.id.retryButton)

        // Configure WebView Settings & Custom User-Agent
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT

        // Native Device User-Agent + ' Mehedi Hasan'
        val defaultUserAgent = webSettings.userAgentString
        webSettings.userAgentString = "$defaultUserAgent Mehedi Hasan"

        // Setup WebViewClient with full Error interception (403, 404, 500, SSL & Offline)
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val nextUrl = request?.url.toString()
                view?.loadUrl(nextUrl)
                return true
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                if (isNetworkAvailable()) {
                    showWebView()
                }
            }

            // Handles Network Disconnection, DNS failure, Connection Timeout
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showOfflineError()
                }
            }

            // Handles HTTP Server/Client Errors (403, 404, 500, 502, 503, etc.)
            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                super.onReceivedHttpError(view, request, errorResponse)
                val statusCode = errorResponse?.statusCode ?: 200
                if (request?.isForMainFrame == true && statusCode >= 400) {
                    showOfflineError()
                }
            }

            // Handles SSL/Certificate Errors cleanly without showing URL
            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: android.net.http.SslError?
            ) {
                handler?.cancel()
                showOfflineError()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress == 100) {
                    swipeRefreshLayout.isRefreshing = false
                }
            }
        }

        // Setup DownloadListener -> Save directly to phone's Download folder
        webView.setDownloadListener { downloadUrl, userAgent, contentDisposition, mimeType, _ ->
            startDownloadProcess(downloadUrl, userAgent, contentDisposition, mimeType)
        }

        // Pull to Refresh Implementation (#004D40)
        swipeRefreshLayout.setColorSchemeColors(
            Color.parseColor("#004D40"),
            Color.parseColor("#00796B"),
            Color.parseColor("#004D40")
        )

        swipeRefreshLayout.setOnRefreshListener {
            loadAppPage()
        }

        // Offline Retry Button Listener
        retryButton.setOnClickListener {
            loadAppPage()
        }

        // Initial Load
        loadAppPage()
    }

    private fun startDownloadProcess(
        downloadUrl: String,
        userAgent: String,
        contentDisposition: String,
        mimeType: String
    ) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            // Check storage permission on Android 9 and below
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
                pendingDownloadRequest = PendingDownload(downloadUrl, userAgent, contentDisposition, mimeType)
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    STORAGE_PERMISSION_CODE
                )
                return
            }
        }
        executeDownload(downloadUrl, userAgent, contentDisposition, mimeType)
    }

    private fun executeDownload(
        downloadUrl: String,
        userAgent: String,
        contentDisposition: String,
        mimeType: String
    ) {
        try {
            val fileName = URLUtil.guessFileName(downloadUrl, contentDisposition, mimeType)
            val request = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
                setMimeType(mimeType)
                addRequestHeader("User-Agent", userAgent)
                setDescription("ডাউনলোড হচ্ছে...")
                setTitle(fileName)
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                // Save directly in the Phone's Public "Download" folder
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
            }

            val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)

            Toast.makeText(
                this,
                "ডাউনলোড শুরু হয়েছে! ফোনের Download ফোল্ডারে সেভ হবে।",
                Toast.LENGTH_LONG
            ).show()
        } catch (e: Exception) {
            Toast.makeText(this, "ডাউনলোড ব্যর্থ হয়েছে: " + e.message, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == STORAGE_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingDownloadRequest?.let {
                    executeDownload(it.url, it.userAgent, it.contentDisposition, it.mimeType)
                    pendingDownloadRequest = null
                }
            } else {
                Toast.makeText(this, "ফাইল সেভ করার জন্য স্টোরেজ পারমিশন আবশ্যক।", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loadAppPage() {
        if (isNetworkAvailable()) {
            showWebView()
            webView.loadUrl(targetUrl)
        } else {
            showOfflineError()
        }
    }

    private fun showWebView() {
        webView.visibility = View.VISIBLE
        offlineLayout.visibility = View.GONE
    }

    private fun showOfflineError() {
        webView.stopLoading()
        webView.visibility = View.GONE
        offlineLayout.visibility = View.VISIBLE
        swipeRefreshLayout.isRefreshing = false
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onBackPressed() {
        if (webView.visibility == View.VISIBLE && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`;

  const xmlCode = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F8FAFC"
    tools:context=".MainActivity">

    <!-- SwipeRefreshLayout containing WebView -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- Pure Static Offline Error View with ZERO Links or URLs -->
    <LinearLayout
        android:id="@+id/offlineLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#F8FAFC"
        android:gravity="center"
        android:orientation="vertical"
        android:padding="24dp"
        android:visibility="gone">

        <ImageView
            android:layout_width="80dp"
            android:layout_height="80dp"
            android:src="@android:drawable/stat_notify_error"
            app:tint="#004D40" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="20dp"
            android:text="সংযোগ বিচ্ছিন্ন রয়েছে"
            android:textColor="#0F172A"
            android:textSize="20sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:gravity="center"
            android:text="সার্ভার বা ইন্টারনেটের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। দয়া করে আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন।"
            android:textColor="#475569"
            android:textSize="14sp" />

        <Button
            android:id="@+id/retryButton"
            android:layout_width="match_parent"
            android:layout_height="52dp"
            android:layout_marginTop="24dp"
            android:backgroundTint="#004D40"
            android:text="পুনরায় চেষ্টা করুন"
            android:textColor="#FFFFFF"
            android:textSize="15sp"
            android:textStyle="bold" />

    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`;

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.funsky.webview">

    <!-- Permissions required for WebView, Internet connection and Download to Downloads folder -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="FunSky"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:requestLegacyExternalStorage="true"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;

  const gradleCode = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.funsky.webview'
    compileSdk 34

    defaultConfig {
        applicationId "com.funsky.webview"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'kotlin':
        return kotlinCode;
      case 'xml':
        return xmlCode;
      case 'manifest':
        return manifestCode;
      case 'gradle':
        return gradleCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Android Studio Project Code (Kotlin)
              </h3>
              <p className="text-xs text-slate-400">
                WebView + Offline Custom Error + SwipeRefreshLayout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kotlin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'kotlin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            MainActivity.kt
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'xml'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            activity_main.xml
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manifest'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gradle'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            build.gradle
          </button>
        </div>

        {/* Code View Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950/90 font-mono text-xs text-slate-300 leading-relaxed">
          <pre className="whitespace-pre">{getActiveCode()}</pre>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Android Studio-তে ফাইলগুলো পেস্ট করে সরাসরি APK বিল্ড করতে পারবেন।
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
