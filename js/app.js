// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultsContainer = document.getElementById('resultsContainer');

// Original SVG elements
const originalSvgPreview = document.getElementById('originalSvgPreview');
const originalSvgCode = document.getElementById('originalSvgCode');
const originalZoomInBtn = document.getElementById('originalZoomInBtn');
const originalZoomOutBtn = document.getElementById('originalZoomOutBtn');
const originalResetZoomBtn = document.getElementById('originalResetZoomBtn');

// Processed SVG elements
const processedSvgPreview = document.getElementById('processedSvgPreview');
const processedSvgCode = document.getElementById('processedSvgCode');
const processedZoomInBtn = document.getElementById('processedZoomInBtn');
const processedZoomOutBtn = document.getElementById('processedZoomOutBtn');
const processedResetZoomBtn = document.getElementById('processedResetZoomBtn');

// State
let originalScale = 1;
let processedScale = 1;
const ZOOM_FACTOR = 1.2;
let highlightedPath = null;

// Event Listeners
uploadBtn.addEventListener('click', handleFileUpload);
fileInput.addEventListener('change', handleFileSelection);

// Original SVG controls
originalZoomInBtn.addEventListener('click', () => handleZoom('original', ZOOM_FACTOR));
originalZoomOutBtn.addEventListener('click', () => handleZoom('original', 1 / ZOOM_FACTOR));
originalResetZoomBtn.addEventListener('click', () => resetZoom('original'));

// Processed SVG controls
processedZoomInBtn.addEventListener('click', () => handleZoom('processed', ZOOM_FACTOR));
processedZoomOutBtn.addEventListener('click', () => handleZoom('processed', 1 / ZOOM_FACTOR));
processedResetZoomBtn.addEventListener('click', () => resetZoom('processed'));

// Handle file selection
function handleFileSelection(event) {
    const files = event.target.files;
    if (files.length > 0) {
        displaySelectedFiles(files);
        previewOriginalSvg(files[0]);
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

// Preview original SVG file
function previewOriginalSvg(file) {
    if (!file.type.includes('svg')) {
        showMessage('Please select an SVG file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const svgContent = e.target.result;
        originalSvgPreview.innerHTML = svgContent;
        originalSvgCode.textContent = formatSvgCode(svgContent);
        resetZoom('original');
        
        // For now, just copy the original to processed
        // This will be replaced with actual processing later
        processedSvgPreview.innerHTML = svgContent;
        processedSvgCode.textContent = formatSvgCode(svgContent);
        resetZoom('processed');

        // Add path highlighting functionality
        setupPathHighlighting();
    };
    reader.readAsText(file);
}

// Setup path highlighting
function setupPathHighlighting() {
    const paths = document.querySelectorAll('.svg-preview path');
    paths.forEach(path => {
        // Add hover events
        path.addEventListener('mouseenter', handlePathHover);
        path.addEventListener('mouseleave', handlePathLeave);
        path.addEventListener('click', handlePathClick);
    });
}

// Handle path hover
function handlePathHover(event) {
    const path = event.target;
    const pathId = path.id || path.getAttribute('data-path-id');
    
    // Highlight the path in both previews
    highlightPath(pathId);
}

// Handle path leave
function handlePathLeave(event) {
    const path = event.target;
    const pathId = path.id || path.getAttribute('data-path-id');
    
    // Only remove highlight if it's not the selected path
    if (highlightedPath !== pathId) {
        removeHighlight(pathId);
    }
}

// Handle path click
function handlePathClick(event) {
    const path = event.target;
    const pathId = path.id || path.getAttribute('data-path-id');
    
    if (highlightedPath === pathId) {
        // If clicking the same path, remove highlight
        removeHighlight(pathId);
        highlightedPath = null;
    } else {
        // Highlight the clicked path
        highlightPath(pathId);
        highlightedPath = pathId;
    }
}

// Highlight path
function highlightPath(pathId) {
    // Highlight in both previews
    const paths = document.querySelectorAll(`.svg-preview path[id="${pathId}"], .svg-preview path[data-path-id="${pathId}"]`);
    paths.forEach(path => {
        path.classList.add('highlighted');
    });

    // Highlight in code
    highlightPathInCode(pathId);
}

// Remove highlight
function removeHighlight(pathId) {
    // Remove highlight from both previews
    const paths = document.querySelectorAll(`.svg-preview path[id="${pathId}"], .svg-preview path[data-path-id="${pathId}"]`);
    paths.forEach(path => {
        path.classList.remove('highlighted');
    });

    // Remove highlight from code
    removeHighlightFromCode(pathId);
}

// Highlight path in code
function highlightPathInCode(pathId) {
    const codeElements = document.querySelectorAll('.svg-code');
    codeElements.forEach(codeElement => {
        const code = codeElement.textContent;
        const pathRegex = new RegExp(`<path[^>]*id="${pathId}"[^>]*>|<path[^>]*data-path-id="${pathId}"[^>]*>`, 'g');
        const highlightedCode = code.replace(pathRegex, match => `<span class="highlighted">${match}</span>`);
        codeElement.innerHTML = highlightedCode;
    });
}

// Remove highlight from code
function removeHighlightFromCode(pathId) {
    const codeElements = document.querySelectorAll('.svg-code');
    codeElements.forEach(codeElement => {
        const code = codeElement.innerHTML;
        const pathRegex = new RegExp(`<span class="highlighted">(<path[^>]*id="${pathId}"[^>]*>|<path[^>]*data-path-id="${pathId}"[^>]*>)</span>`, 'g');
        const unhighlightedCode = code.replace(pathRegex, '$1');
        codeElement.innerHTML = unhighlightedCode;
    });
}

// Format SVG code for display
function formatSvgCode(svgContent) {
    // Add unique IDs to paths if they don't have one
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    
    paths.forEach((path, index) => {
        if (!path.id) {
            path.setAttribute('data-path-id', `path-${index}`);
        }
    });

    // Format the code
    return doc.documentElement.outerHTML
        .replace(/></g, '>\n<')
        .replace(/\s+/g, ' ')
        .trim();
}

// Handle zoom
function handleZoom(type, factor) {
    const preview = type === 'original' ? originalSvgPreview : processedSvgPreview;
    const scale = type === 'original' ? originalScale : processedScale;
    const svg = preview.querySelector('svg');
    
    if (!svg) return;

    if (type === 'original') {
        originalScale *= factor;
        svg.style.transform = `scale(${originalScale})`;
    } else {
        processedScale *= factor;
        svg.style.transform = `scale(${processedScale})`;
    }
}

// Reset zoom
function resetZoom(type) {
    const preview = type === 'original' ? originalSvgPreview : processedSvgPreview;
    const svg = preview.querySelector('svg');
    
    if (!svg) return;

    if (type === 'original') {
        originalScale = 1;
        svg.style.transform = 'scale(1)';
    } else {
        processedScale = 1;
        svg.style.transform = 'scale(1)';
    }
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