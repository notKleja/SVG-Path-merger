// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultsContainer = document.getElementById('resultsContainer');
const svgPreview = document.getElementById('svgPreview');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');

// State
let currentScale = 1;
const ZOOM_FACTOR = 1.2;

// Event Listeners
uploadBtn.addEventListener('click', handleFileUpload);
fileInput.addEventListener('change', handleFileSelection);
zoomInBtn.addEventListener('click', () => handleZoom(ZOOM_FACTOR));
zoomOutBtn.addEventListener('click', () => handleZoom(1 / ZOOM_FACTOR));
resetZoomBtn.addEventListener('click', resetZoom);

// Handle file selection
function handleFileSelection(event) {
    const files = event.target.files;
    if (files.length > 0) {
        displaySelectedFiles(files);
        previewSVG(files[0]); // Preview the first SVG file
    }
}

// Handle file upload
function handleFileUpload() {
    const files = fileInput.files;
    if (files.length === 0) {
        showMessage('Please select files to upload', 'error');
        return;
    }

    // Here you would typically send the files to a server
    // For now, we'll just display a success message
    showMessage('Files uploaded successfully!', 'success');
    processFiles(files);
}

// Display selected files
function displaySelectedFiles(files) {
    const fileList = Array.from(files)
        .map(file => `<li>${file.name} (${formatFileSize(file.size)})</li>`)
        .join('');
    
    resultsContainer.innerHTML = `
        <h3>Selected Files:</h3>
        <ul>${fileList}</ul>
    `;
}

// Preview SVG file
function previewSVG(file) {
    if (!file.type.includes('svg')) {
        showMessage('Please select an SVG file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        svgPreview.innerHTML = e.target.result;
        resetZoom(); // Reset zoom when new SVG is loaded
    };
    reader.readAsText(file);
}

// Handle zoom
function handleZoom(factor) {
    const svg = svgPreview.querySelector('svg');
    if (!svg) return;

    currentScale *= factor;
    svg.style.transform = `scale(${currentScale})`;
}

// Reset zoom
function resetZoom() {
    const svg = svgPreview.querySelector('svg');
    if (!svg) return;

    currentScale = 1;
    svg.style.transform = 'scale(1)';
}

// Process files (placeholder for actual processing logic)
function processFiles(files) {
    // This is where you would implement the actual file processing logic
    console.log('Processing files:', files);
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    resultsContainer.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 