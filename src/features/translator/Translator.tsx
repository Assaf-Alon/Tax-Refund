import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './Translator.css';
import translatorOverlay from './translator.png';

export const Translator: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [translatedText, setTranslatedText] = useState('Scanning for Nomai text...');
  const [isTyping, setIsTyping] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const typewriterIntervalRef = useRef<number | null>(null);
  const isScanningOnCooldownRef = useRef(false);

  // Typewriter effect function
  const setOuterWildsText = (text: string) => {
    if (text === translatedText) return;

    if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
    }
    
    setTranslatedText('');
    setIsTyping(true);
    
    let i = 0;
    typewriterIntervalRef.current = window.setInterval(() => {
        if (i < text.length) {
            setTranslatedText(prev => prev + text.charAt(i));
            i++;
        } else {
            if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
            setIsTyping(false);
        }
    }, 50);
  };

  const startScanner = async () => {
    if (!window.isSecureContext) {
      alert("CRITICAL: Camera streaming requires a Secure Context (HTTPS).\n\nYou are likely on http://. Please ensure you use https:// in your browser address bar.");
      return;
    }

    setHasPermission(true);

    // Wait for the 'reader' div to be rendered
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const qrSize = Math.min(window.innerWidth, window.innerHeight) * 0.5;
        const config = { 
            fps: 10,
            qrbox: { width: qrSize, height: qrSize }
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isScanningOnCooldownRef.current) return;
            
            console.log(`Scan result: ${decodedText}`);
            setOuterWildsText(decodedText);
            
            isScanningOnCooldownRef.current = true;
            setTimeout(() => {
                isScanningOnCooldownRef.current = false;
            }, 2000);
          },
          () => {
            // No QR code found in this frame
          }
        );
      } catch (err) {
        console.error(err);
        alert("Error starting camera: " + err);
        setHasPermission(false);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      // Cleanup: Stop scanning and clear intervals
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="translator-feature">
      {!hasPermission ? (
        <div id="permission-ui">
          <h2>Camera Access Required</h2>
          <p>Please grant camera permissions to use the translator tool.</p>
          <button id="start-btn" onClick={startScanner}>Initialize Translator</button>
        </div>
      ) : (
        <div id="app-container">
          <div id="reader"></div>
          
          <svg id="qr-canvas" width="100%" height="100%"></svg>

          <div id="overlay-container">
            <img id="overlay" src={translatorOverlay} alt="Outer Wilds Translator Overlay" />
            <div id="translated-text">
              {translatedText}
              {isTyping && <span className="cursor">_</span>}
            </div>
          </div>
        </div>
      )}
      
      {/* Link to Google Fonts for Share Tech Mono */}
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
    </div>
  );
};

export default Translator;
