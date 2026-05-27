/**
 * FixMyFinance Application Router
 * Stitches together the wireframe strings into a working Single Page App.
 */

// We assume screens-bundle.js loaded first and provided these global string literals:
// landingDesktop, uploadDesktop, processingDesktop, txnDesktop, insightsDesktop

const AppState = {
  currentScreen: 'landing',
  apiData: null
};

// Map screen keys to their raw HTML templates
const TEMPLATES = {
  'landing': typeof landingDesktop !== 'undefined' ? landingDesktop : '',
  'upload': typeof uploadDesktop !== 'undefined' ? uploadDesktop : '',
  'processing': typeof processingDesktop !== 'undefined' ? processingDesktop : '',
  'txn': typeof txnDesktop !== 'undefined' ? txnDesktop : '',
  'insights': typeof insightsDesktop !== 'undefined' ? insightsDesktop : ''
};

// Extracts just the `.desktop` UI from the wireframe markup wrapper
function extractUI(rawHtml) {
  const temp = document.createElement('div');
  temp.innerHTML = rawHtml;
  const desktopNode = temp.querySelector('.desktop');
  return desktopNode ? desktopNode.outerHTML : rawHtml;
}

function navigate(screenName) {
  const root = document.getElementById('app-root');
  if (!root) return;

  AppState.currentScreen = screenName;
  root.innerHTML = extractUI(TEMPLATES[screenName]);

  // Bind events for the newly injected DOM
  bindEvents(screenName);
}

function bindEvents(screenName) {
  if (screenName === 'landing') {
    // Both buttons point to the upload screen
    const btns = document.querySelectorAll('.btn');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('upload');
      });
    });
  }

  if (screenName === 'upload') {
    // Dropzone logic
    const dropzone = document.querySelector('.scribble-dashed');
    if (dropzone) {
      dropzone.style.cursor = 'pointer';
      
      // Highlight on drag
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = 'var(--blue-soft)';
      });
      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = 'transparent';
      });

      // Handle Drop
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = 'transparent';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      // Fake file input for clicking
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.csv,image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      dropzone.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Try sample data
    const sampleBtn = document.querySelector('.btn.ghost.sm');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Skip upload, pretend we uploaded a sample file
        startProcessingSimulator();
      });
    }
  }

  if (screenName === 'processing') {
    // Visual processing loop for ~3 seconds, then go to insights
    // Wait, the API call is happening in the background!
  }

  if (screenName === 'insights') {
    // Optional: We can dynamically map AppState.apiData into the DOM here
    // For Phase 1, we just render the raw template to ensure transition works.
    if (AppState.apiData) {
        console.log("Successfully rendered Insights. Data from API:", AppState.apiData);
    }
  }
}

// Core API hook
function handleFileUpload(file) {
  console.log("File picked:", file.name, file.size);
  // Transition immediately to Processing screen
  navigate('processing');

  // Start the actual backend POST
  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/parse', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    AppState.apiData = data;
    // Introduce an artificial 2 second delay so user enjoys the processing animation
    setTimeout(() => {
        navigate('insights'); 
    }, 2000);
  })
  .catch(error => {
    console.error("Error parsing file:", error);
    alert("Failed to parse file. Ensure backend is running!");
    navigate('upload'); // Go back
  });
}

function startProcessingSimulator() {
    navigate('processing');
    
    // Simulate API delay for sample data
    setTimeout(() => {
        fetch('/api/parse', { method: 'POST' }) // fake call to fail locally if no backend, but let's just mock data
        .then(() => { navigate('insights'); })
        .catch(() => { navigate('insights'); })
    }, 2500);
}

// Init App
document.addEventListener('DOMContentLoaded', () => {
  navigate('landing');
});
