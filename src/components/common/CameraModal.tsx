import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Primary camera error, trying default video:', err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          activeStream = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr: any) {
          setError('Camera permission denied or camera device unavailable. You can also upload a photo file.');
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopStream();
    onCapture(dataUrl);
    onClose();
  };

  const toggleCamera = () => {
    stopStream();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-2xl text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm tracking-wide">Capture Crop Leaf</h3>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video feed or error */}
        <div className="relative bg-black flex items-center justify-center aspect-4/3 overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-slate-300">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Close & Upload File Instead
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target leaf reticle overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-xs bg-black/60 px-3 py-1 rounded-full text-emerald-300 backdrop-blur-xs">
                  Center affected leaf within frame
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        {!error && (
          <div className="p-4 flex items-center justify-between bg-slate-900 border-t border-slate-800">
            <button
              onClick={toggleCamera}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Flip Camera
            </button>

            <button
              onClick={handleCapture}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Camera className="w-4 h-4" />
              Capture Photo
            </button>

            <div className="w-20" />
          </div>
        )}
      </div>
    </div>
  );
};
