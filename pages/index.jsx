import { useRef } from 'react';
import styles from '../styles/index.module.css';

export default function Index() {
  const videoRef = useRef(null);
  const aRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  function dumpOptionsInfo() {
    const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
    console.info('Track settings:');
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info('Track constraints:');
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
  }

  function OnDataAvailable(event) {
    const url = URL.createObjectURL(event.data);
    aRef.current.href = url;
    aRef.current.download = 'recording.webm';
    aRef.current.click();

    URL.revokeObjectURL(url);
  }

  async function startCapture() {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
        },
        audio: false,
      });
      videoRef.current.srcObject = mediaStream;

      mediaRecorderRef.current = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm; codecs=vp9',
      });
      mediaRecorderRef.current.ondataavailable = OnDataAvailable;
      mediaRecorderRef.current.start();

      dumpOptionsInfo();
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  function stopCapture() {
    mediaRecorderRef.current.stop();

    const tracks = videoRef.current.srcObject.getTracks();
    if (tracks) {
      tracks.forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;
  }

  return (
    <main>
      <p>
        <button id="start" onClick={startCapture}>
          Start Capture
        </button>
        &nbsp;
        <button id="stop" onClick={stopCapture}>
          Stop Capture
        </button>
      </p>

      <video
        id="video"
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
      ></video>

      <a ref={aRef} className={styles.downloadLink}></a>
    </main>
  );
}
