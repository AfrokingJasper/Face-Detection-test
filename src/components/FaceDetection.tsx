import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [faceData, setFaceData] = useState<{
    gender: string;
    age: number;
    expression: string;
  } | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"
          ),
          faceapi.nets.faceLandmark68Net.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"
          ),
          faceapi.nets.faceRecognitionNet.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"
          ),
          faceapi.nets.faceExpressionNet.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"
          ),
          faceapi.nets.ageGenderNet.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights"
          ),
        ]);

        setLoading(false);
        startVideo();
      } catch (err) {
        alert("Error loading models. Please refresh the page.");
      }
    };

    loadModels();
  }, []);

  const getDetailedExpression = (expressions: faceapi.FaceExpressions) => {
    const expressionMap = {
      happy: expressions.happy,
      sad: expressions.sad,
      angry: expressions.angry,
      fearful: expressions.fearful,
      disgusted: expressions.disgusted,
      surprised: expressions.surprised,
      neutral: expressions.neutral,
    };

    return Object.entries(expressionMap).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
  };

  const startVideo = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Video capture not supported on this device");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((err) => {
              console.error("Error playing video:", err);
              alert("Could not start video stream");
            });
            handleVideoPlay();
          };
        }
      })
      .catch((err) => {
        setCameraError(true);
        console.error("Webcam access error:", err);
        alert("Please grant camera permissions");
      });
  };

  const handleVideoPlay = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      const detectFaces = async () => {
        if (video) {
          try {
            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions()
              .withAgeAndGender();

            const resizedDetections = faceapi.resizeResults(
              detections,
              displaySize
            );

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              resizedDetections.forEach((detection) => {
                const { age, gender, genderProbability, expressions } =
                  detection;

                const expression = getDetailedExpression(expressions);

                setFaceData({
                  age: Math.round(age),
                  gender,
                  expression,
                });

                const drawBox = new faceapi.draw.DrawBox(
                  detection.detection.box,
                  {
                    label: `Age: ${Math.round(age)} years, ${gender} (${(
                      genderProbability * 100
                    ).toFixed(2)}%)`,
                  }
                );
                drawBox.draw(canvas);
              });

              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
              faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
          } catch (error) {
            console.error("Face detection error:", error);
          }
        }
        requestAnimationFrame(detectFaces);
      };

      detectFaces();
    }
  };

  const handleSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setSnapshot(canvas.toDataURL("image/png"));
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-lg font-semibold">Face Detection Test</h1>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      )}

      {cameraError && (
        <div className="text-red-500 mt-4">
          Camera access denied. Please check your permissions.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading models...</p>
      ) : (
        <p className="text-gray-700">Models loaded. Start video.</p>
      )}

      <div className="relative">
        <video ref={videoRef} muted className="border-2 border-gray-300" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
      </div>

      <button
        onClick={handleSnapshot}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Take Snapshot
      </button>

      {snapshot && (
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold">Snapshot</h2>
          <img
            src={snapshot}
            alt="Snapshot"
            className="mt-2 max-w-xs mx-auto rounded-lg"
          />

          {faceData && (
            <div className="mt-4 text-left">
              <h3 className="text-lg font-semibold">Detected Info:</h3>
              <p className="text-gray-700">Gender: {faceData.gender}</p>
              <p className="text-gray-700">Age Range: {faceData.age} years</p>
              <p className="text-gray-700">Expression: {faceData.expression}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceDetection;
