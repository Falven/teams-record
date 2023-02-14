import { useRef } from 'react';
import styles from '../styles/index.module.css';

export default function Index() {
  const videoRef = useRef(null);
  const aRef = useRef(null);
  const logRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const mediaBuffer = [];

  function handleDataAvailable(event) {
    console.log('data-available');
    if (event.data.size > 0) {
      mediaBuffer.push(event.data);
      console.log(mediaBuffer);
    }
  }

  function dumpOptionsInfo() {
    const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
    console.info('Track settings:');
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info('Track constraints:');
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
  }

  async function startCapture() {
    logRef.innerHTML = '';
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
        },
        audio: false,
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
      });
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.start();

      videoRef.current.srcObject = stream;

      dumpOptionsInfo();
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  function stopCapture(evt) {
    let tracks = videoRef.current.srcObject.getTracks();
    if (tracks) {
      tracks.forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;

    const blob = new Blob(mediaBuffer, {
      type: 'video/webm',
    });
    const url = URL.createObjectURL(blob);
    aRef.current.href = url;
    aRef.current.download = 'test.webm';
    aRef.current.click();
    URL.revokeObjectURL(url);
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
