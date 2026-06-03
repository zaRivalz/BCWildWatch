/**
 * report.js — BC WildWatch incident reporting form
 *
 * Responsibilities:
 *  1. Capture geolocation (lat/lng)
 *  2. Handle file selection, preview, and base64 encoding
 *  3. Submit form data to /api/submit-report
 *  4. Show success / error feedback
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Element refs ──────────────────────────────────────────────────────────────
const form       = document.getElementById('report-form');
const geoBtn     = document.getElementById('btn-geolocate');
const geoStatus  = document.getElementById('geo-status');
const latField   = document.getElementById('field-lat');
const lngField   = document.getElementById('field-lng');
const addrField  = document.getElementById('field-address');
const descField  = document.getElementById('field-desc');
const descCount  = document.getElementById('desc-count');
const fileInput  = document.getElementById('field-file');
const dropZone   = document.getElementById('file-drop-zone');
const filePreview = document.getElementById('file-preview');
const submitBtn  = document.getElementById('btn-submit');
const errorMsg   = document.getElementById('form-error');
const successMsg = document.getElementById('form-success');
const overlay    = document.getElementById('submit-overlay');
const overlayMsg = document.getElementById('overlay-msg');

// ── State ─────────────────────────────────────────────────────────────────────
let selectedFile = null;
let fileBase64   = null;

// ── Character counter ─────────────────────────────────────────────────────────
descField?.addEventListener('input', () => {
  descCount.textContent = descField.value.length;
});

// ── Geolocation ───────────────────────────────────────────────────────────────
geoBtn?.addEventListener('click', requestGeo);

function requestGeo() {
  if (!navigator.geolocation) {
    setGeoStatus('err', '❌ Geolocation is not supported by your browser.');
    return;
  }
  setGeoStatus('', '⏳ Acquiring location…');
  geoBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      latField.value = latitude.toFixed(6);
      lngField.value = longitude.toFixed(6);
      setGeoStatus('ok', `✅ Location captured (±${Math.round(accuracy)} m)`);
      geoBtn.disabled = false;
    },
    (err) => {
      const msg = {
        1: 'Permission denied. Please allow location access.',
        2: 'Position unavailable. Try again or enter your address manually.',
        3: 'Location request timed out. Try again.',
      }[err.code] ?? 'Unknown geolocation error.';
      setGeoStatus('err', `❌ ${msg}`);
      geoBtn.disabled = false;
    },
    { timeout: 15000, maximumAge: 30000, enableHighAccuracy: true }
  );
}

function setGeoStatus(cls, text) {
  geoStatus.className = 'geo-status' + (cls ? ` ${cls}` : '');
  geoStatus.textContent = text;
}

// ── File handling ─────────────────────────────────────────────────────────────
fileInput?.addEventListener('change', () => handleFileSelection(fileInput.files[0]));

// Drag & drop
dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone?.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'));
dropZone?.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFileSelection(e.dataTransfer.files[0]);
});

function handleFileSelection(file) {
  if (!file) return;

  if (file.size > MAX_FILE_BYTES) {
    showError('File is too large. Please upload a file under 10 MB.');
    return;
  }

  selectedFile = file;
  encodeFileToBase64(file).then(b64 => {
    fileBase64 = b64;
    renderFilePreview(file);
  });
}

function encodeFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]); // strip data URI prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderFilePreview(file) {
  const isImage = file.type.startsWith('image/');
  const sizeStr = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(1)} KB`
    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  filePreview.innerHTML = `
    ${isImage
      ? `<img class="file-preview-thumb" src="${URL.createObjectURL(file)}" alt="preview" />`
      : `<span style="font-size:2rem">📎</span>`}
    <div class="file-preview-info">
      <div class="file-preview-name" title="${escHtml(file.name)}">${escHtml(file.name)}</div>
      <div class="file-preview-size">${sizeStr}</div>
    </div>
    <button class="file-preview-remove" type="button" title="Remove file">✕</button>
  `;
  filePreview.classList.remove('hidden');
  filePreview.querySelector('.file-preview-remove').addEventListener('click', clearFile);
}

function clearFile() {
  selectedFile = null;
  fileBase64   = null;
  fileInput.value = '';
  filePreview.innerHTML = '';
  filePreview.classList.add('hidden');
}

// ── Form submission ───────────────────────────────────────────────────────────
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const animal = window.__selectedAnimal;
  if (!animal?.id) {
    showError('No animal selected. Please go back and choose an animal type.');
    return;
  }

  const addressDescription = addrField.value.trim();
  const description        = descField.value.trim();

  if (!addressDescription) { showError('Please enter an address / location description.'); return; }
  if (!description)         { showError('Please enter an incident description.');           return; }

  const payload = {
    animalId:            animal.id,
    animalName:          animal.name,
    addressDescription,
    description,
    latitude:            latField.value ? parseFloat(latField.value)  : null,
    longitude:           lngField.value ? parseFloat(lngField.value) : null,
    fileName:            selectedFile ? selectedFile.name : null,
    fileContent:         fileBase64 ?? null,
    fileMimeType:        selectedFile ? selectedFile.type : null,
  };

  showOverlay('Submitting your report…');
  setFormLocked(true);

  try {
    const res = await fetch('/api/submit-report', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error ?? `Server error (HTTP ${res.status})`);
    }

    hideOverlay();
    showSuccess(`✅ Report submitted! Reference: <strong>${data.reportId ?? 'N/A'}</strong>. Campus security has been notified.`);
    resetForm();

  } catch (err) {
    hideOverlay();
    showError(`Submission failed: ${err.message}. Please try again or contact Campus Security directly.`);
  } finally {
    setFormLocked(false);
  }
});

// ── Reset form state ──────────────────────────────────────────────────────────
function resetForm() {
  form.reset();
  clearFile();
  latField.value = '';
  lngField.value = '';
  setGeoStatus('', 'Location not captured yet');
  descCount.textContent = '0';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showError(msg) {
  errorMsg.innerHTML  = msg;
  errorMsg.classList.remove('hidden');
  errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showSuccess(msg) {
  successMsg.innerHTML = msg;
  successMsg.classList.remove('hidden');
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function clearMessages() {
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
}
function setFormLocked(locked) {
  submitBtn.disabled = locked;
  submitBtn.textContent = locked ? 'Submitting…' : 'Submit Report';
}
function showOverlay(msg) {
  overlayMsg.textContent = msg;
  overlay.classList.remove('hidden');
}
function hideOverlay() {
  overlay.classList.add('hidden');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Reset when a new animal is selected ───────────────────────────────────────
document.addEventListener('animal:selected', () => {
  clearMessages();
  clearFile();
  setGeoStatus('', 'Location not captured yet');
  latField.value = '';
  lngField.value = '';
  // Auto-request geolocation on every new report
  requestGeo();
});
