const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileStatus = document.getElementById('fileStatus');
const videoElement = document.getElementById('video');
const captionText = document.getElementById('captionText');
const videoWrapper = document.getElementById('videoWrapper');
const loadedFiles = document.getElementById('loadedFiles');

let captionCues = [];
let videoFileName = '';
let captionFileName = '';

const resetState = () => {
  captionCues = [];
  captionText.textContent = '';
  videoFileName = '';
  captionFileName = '';
  loadedFiles.textContent = '';
};

const handleFiles = (files) => {
  resetState();

  const fileArray = Array.from(files);
  const videoFile = fileArray.find((file) => file.type.startsWith('video'));
  const captionFile = fileArray.find((file) => /\.vv?t$/i.test(file.name));

  if (!videoFile || !captionFile) {
    fileStatus.textContent = 'Please provide both a video file and a .vvt caption file.';
    videoWrapper.style.display = 'none';
    if (!videoFile) {
      console.warn('Video file missing in drop.');
    }
    if (!captionFile) {
      console.warn('Caption file missing in drop.');
    }
    return;
  }

  fileStatus.textContent = 'Processing files…';
  loadVideo(videoFile);
  loadCaptions(captionFile);
};

const loadVideo = (file) => {
  const url = URL.createObjectURL(file);
  videoElement.src = url;
  videoFileName = file.name;
  videoElement.addEventListener(
    'loadedmetadata',
    () => {
      videoWrapper.style.display = 'flex';
      updateLoadedFiles();
    },
    { once: true },
  );
};

const loadCaptions = (file) => {
  captionFileName = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    captionCues = parseVVT(event.target.result);
    fileStatus.textContent = 'Files loaded!';
    updateLoadedFiles();
  };
  reader.onerror = () => {
    console.error('Failed to read caption file.');
    fileStatus.textContent = 'Failed to read the caption file.';
  };
  reader.readAsText(file);
};

const parseVVT = (content) => {
  const lines = content.split(/\r?\n/);
  const cues = [];
  let i = 0;

  const timeToSeconds = (timestamp) => {
    const [time, milli = '0'] = timestamp.split('.');
    const parts = time.split(':').map(Number);
    const seconds = parts.reduce((acc, value) => acc * 60 + value, 0);
    return seconds + (parseInt(milli, 10) || 0) / Math.pow(10, milli.length);
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    // Skip possible cue identifiers
    if (!line.includes('-->') && i + 1 < lines.length && lines[i + 1].includes('-->')) {
      i += 1;
      continue;
    }

    if (line.includes('-->')) {
      const [startRaw, endRaw] = line.split('-->').map((part) => part.trim());
      const start = timeToSeconds(startRaw);
      const end = timeToSeconds(endRaw.split(' ')[0]);
      i += 1;
      let text = '';
      while (i < lines.length && lines[i].trim()) {
        text += (text ? '\n' : '') + lines[i].trim();
        i += 1;
      }
      cues.push({ start, end, text });
    } else {
      i += 1;
    }
  }

  return cues;
};

const findCaptionForTime = (time) => {
  return captionCues.find((cue) => time >= cue.start && time <= cue.end);
};

const updateCaption = () => {
  const currentTime = videoElement.currentTime;
  const cue = findCaptionForTime(currentTime);
  captionText.textContent = cue ? cue.text : '';
};

const updateLoadedFiles = () => {
  if (videoFileName && captionFileName) {
    loadedFiles.textContent = `Loaded video: ${videoFileName} | Captions: ${captionFileName}`;
  }
};

const onDragOver = (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
};

const onDragLeave = () => {
  dropZone.classList.remove('dragover');
};

const onDrop = (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const { files } = event.dataTransfer;
  handleFiles(files);
};

dropZone.addEventListener('dragover', onDragOver);
dropZone.addEventListener('dragleave', onDragLeave);
dropZone.addEventListener('drop', onDrop);
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (event) => {
  if (event.target.files.length) {
    handleFiles(event.target.files);
  }
});

videoElement.addEventListener('timeupdate', updateCaption);
videoElement.addEventListener('seeked', updateCaption);
videoElement.addEventListener('emptied', () => {
  captionText.textContent = '';
});
