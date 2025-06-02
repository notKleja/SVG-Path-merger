// DOM Elements
const fileInput = document.getElementById('fileInput');
const resultsContainer = document.getElementById('resultsContainer');

// Original SVG elements
const originalSvgPreview = document.getElementById('originalSvgPreview');
const originalSvgCode = document.getElementById('originalSvgCode');
const originalZoomInBtn = document.getElementById('originalZoomInBtn');
const originalZoomOutBtn = document.getElementById('originalZoomOutBtn');
const originalResetZoomBtn = document.getElementById('originalResetZoomBtn');
const originalColorizeBtn = document.getElementById('originalColorizeBtn');

// Processed SVG elements
const processedSvgPreview = document.getElementById('processedSvgPreview');
const processedSvgCode = document.getElementById('processedSvgCode');
const processedZoomInBtn = document.getElementById('processedZoomInBtn');
const processedZoomOutBtn = document.getElementById('processedZoomOutBtn');
const processedResetZoomBtn = document.getElementById('processedResetZoomBtn');
const processedColorizeBtn = document.getElementById('processedColorizeBtn');

// State
let originalScale = 1;
let processedScale = 1;
const ZOOM_FACTOR = 1.2;
let highlightedPath = null;
let originalColors = new Map();
let processedColors = new Map();

// Event Listeners
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const svgContent = await file.text();
        displayOriginalSvg(svgContent);
        processSvg(svgContent);
    } catch (error) {
        console.error('Error reading file:', error);
        resultsContainer.innerHTML = `<p class="error">Error reading file: ${error.message}</p>`;
    }
});

// Original SVG controls
originalZoomInBtn.addEventListener('click', () => handleZoom('original', ZOOM_FACTOR));
originalZoomOutBtn.addEventListener('click', () => handleZoom('original', 1 / ZOOM_FACTOR));
originalResetZoomBtn.addEventListener('click', () => resetZoom('original'));
originalColorizeBtn.addEventListener('click', () => toggleColorize('original'));

// Processed SVG controls
processedZoomInBtn.addEventListener('click', () => handleZoom('processed', ZOOM_FACTOR));
processedZoomOutBtn.addEventListener('click', () => handleZoom('processed', 1 / ZOOM_FACTOR));
processedResetZoomBtn.addEventListener('click', () => resetZoom('processed'));
processedColorizeBtn.addEventListener('click', () => toggleColorize('processed'));

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
    const formattedCode = doc.documentElement.outerHTML
        .replace(/></g, '>\n<')
        .replace(/\s+/g, ' ')
        .trim();

    return formattedCode;
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

// Generate random color
function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
    const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Toggle colorize
function toggleColorize(type) {
    const preview = type === 'original' ? originalSvgPreview : processedSvgPreview;
    const button = type === 'original' ? originalColorizeBtn : processedColorizeBtn;
    const colors = type === 'original' ? originalColors : processedColors;
    
    if (preview.classList.contains('colorized')) {
        // Remove colors
        preview.classList.remove('colorized');
        button.classList.remove('active');
        const paths = preview.querySelectorAll('path');
        paths.forEach(path => {
            const pathId = path.id || path.getAttribute('data-path-id');
            const originalColor = colors.get(pathId);
            if (originalColor) {
                path.style.fill = originalColor.fill;
                path.style.stroke = originalColor.stroke;
            }
        });
    } else {
        // Add colors
        preview.classList.add('colorized');
        button.classList.add('active');
        const paths = preview.querySelectorAll('path');
        paths.forEach(path => {
            const pathId = path.id || path.getAttribute('data-path-id');
            // Store original colors
            if (!colors.has(pathId)) {
                colors.set(pathId, {
                    fill: path.style.fill || path.getAttribute('fill') || 'none',
                    stroke: path.style.stroke || path.getAttribute('stroke') || 'none'
                });
            }
            // Apply random color
            const color = generateRandomColor();
            path.style.fill = color;
            path.style.stroke = color;
        });
    }
}

// Highlight path in code
function highlightPathInCode(pathId) {
    const codeElements = document.querySelectorAll('.svg-code');
    codeElements.forEach(codeElement => {
        const code = codeElement.textContent;
        const pathRegex = new RegExp(`<path[^>]*id="${pathId}"[^>]*>|<path[^>]*data-path-id="${pathId}"[^>]*>`, 'g');
        const highlightedCode = code.replace(pathRegex, match => `[HIGHLIGHT]${match}[/HIGHLIGHT]`);
        codeElement.textContent = highlightedCode;
    });
}

// Remove highlight from code
function removeHighlightFromCode(pathId) {
    const codeElements = document.querySelectorAll('.svg-code');
    codeElements.forEach(codeElement => {
        const code = codeElement.textContent;
        const pathRegex = new RegExp(`\\[HIGHLIGHT\\](<path[^>]*id="${pathId}"[^>]*>|<path[^>]*data-path-id="${pathId}"[^>]*>)\\[/HIGHLIGHT\\]`, 'g');
        const unhighlightedCode = code.replace(pathRegex, '$1');
        codeElement.textContent = unhighlightedCode;
    });
}

// Display original SVG
function displayOriginalSvg(svgContent) {
    // Display in preview
    originalSvgPreview.innerHTML = svgContent;
    
    // Display formatted code as text
    originalSvgCode.textContent = formatSvgCode(svgContent);
    
    // Setup path highlighting
    setupPathHighlighting();
    
    // Reset zoom
    resetZoom('original');
}

// Process SVG
function processSvg(svgContent) {
    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Get all paths
    const paths = doc.querySelectorAll('path');
    if (paths.length <= 1) {
        // If there's only one or no paths, just display as is
        displayProcessedSvg(svgContent);
        return;
    }

    // Get the first path to use as the base
    const firstPath = paths[0];
    let mergedPathData = firstPath.getAttribute('d');
    
    // Combine all path data
    for (let i = 1; i < paths.length; i++) {
        const pathData = paths[i].getAttribute('d');
        if (pathData) {
            // Add a space and M command if the path data doesn't start with M
            if (!pathData.trim().startsWith('M')) {
                mergedPathData += ' M';
            }
            mergedPathData += ' ' + pathData;
        }
    }

    // Create new SVG with merged path
    const newSvg = doc.documentElement.cloneNode(true);
    // Remove all existing paths
    const existingPaths = newSvg.querySelectorAll('path');
    existingPaths.forEach(path => path.remove());
    
    // Create new merged path
    const mergedPath = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    mergedPath.setAttribute('d', mergedPathData);
    // Copy attributes from first path (except d)
    Array.from(firstPath.attributes).forEach(attr => {
        if (attr.name !== 'd') {
            mergedPath.setAttribute(attr.name, attr.value);
        }
    });
    
    // Add the merged path to the SVG
    newSvg.appendChild(mergedPath);
    
    // Display the processed SVG
    displayProcessedSvg(newSvg.outerHTML);
}

// Display processed SVG
function displayProcessedSvg(svgContent) {
    // Display in preview
    processedSvgPreview.innerHTML = svgContent;
    
    // Display formatted code
    processedSvgCode.textContent = formatSvgCode(svgContent);
    
    // Setup path highlighting
    setupPathHighlighting();
    
    // Reset zoom
    resetZoom('processed');
}