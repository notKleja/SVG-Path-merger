// DOM Elements
const fileInput = document.getElementById('fileInput');
const resetBtn = document.getElementById('resetBtn');

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
const copyProcessedBtn = document.getElementById('copyProcessedBtn');

// Color button
const colorizeBtn = document.getElementById('colorizeBtn');

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
    }
});

// Original SVG controls
originalZoomInBtn.addEventListener('click', () => handleZoom('original', ZOOM_FACTOR));
originalZoomOutBtn.addEventListener('click', () => handleZoom('original', 1 / ZOOM_FACTOR));
originalResetZoomBtn.addEventListener('click', () => resetZoom('original'));

// Processed SVG controls
processedZoomInBtn.addEventListener('click', () => handleZoom('processed', ZOOM_FACTOR));
processedZoomOutBtn.addEventListener('click', () => handleZoom('processed', 1 / ZOOM_FACTOR));
processedResetZoomBtn.addEventListener('click', () => resetZoom('processed'));

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
    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    
    // Add IDs for functionality but don't show them in the code
    paths.forEach((path, index) => {
        if (!path.id) {
            path.setAttribute('data-path-id', `path-${index}`);
        }
    });

    // Create a clean version for display
    const cleanDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const cleanPaths = cleanDoc.querySelectorAll('path');
    cleanPaths.forEach(path => {
        path.removeAttribute('data-path-id');
    });

    // Format the clean code
    const formattedCode = cleanDoc.documentElement.outerHTML
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
    // Predefined color palette with variations
    const colors = [
        // Red variations
        '#F05252', // Red-500
        '#DC2626', // Red-600
        '#B91C1C', // Red-700
        '#EF4444', // Red-400
        
        // Yellow variations
        '#FACA15', // Yellow-500
        '#EAB308', // Yellow-600
        '#CA8A04', // Yellow-700
        '#FCD34D', // Yellow-400
        
        // Green variations
        '#22A06B', // Green-500
        '#059669', // Green-600
        '#047857', // Green-700
        '#34D399', // Green-400
        
        // Blue variations
        '#1C64F2', // Blue-500
        '#2563EB', // Blue-600
        '#1D4ED8', // Blue-700
        '#60A5FA', // Blue-400
        
        // Purple variations
        '#7C3AED', // Purple-500
        '#6D28D9', // Purple-600
        '#5B21B6', // Purple-700
        '#A78BFA', // Purple-400
        
        // Pink variations
        '#EC4899', // Pink-500
        '#DB2777', // Pink-600
        '#BE185D', // Pink-700
        '#F472B6', // Pink-400
        
        // Gray variations
        '#6B7280', // Gray-500
        '#4B5563', // Gray-600
        '#374151', // Gray-700
        '#9CA3AF', // Gray-400
        
        // Additional colors
        '#F97316', // Orange-500
        '#EA580C', // Orange-600
        '#C2410C', // Orange-700
        '#FB923C', // Orange-400
        
        '#14B8A6', // Teal-500
        '#0D9488', // Teal-600
        '#0F766E', // Teal-700
        '#2DD4BF', // Teal-400
        
        '#8B5CF6', // Indigo-500
        '#7C3AED', // Indigo-600
        '#6D28D9', // Indigo-700
        '#A78BFA'  // Indigo-400
    ];
    
    // Return a random color from the palette
    return colors[Math.floor(Math.random() * colors.length)];
}

// Toggle colorize
function toggleColorize() {
    const isColorized = originalSvgPreview.classList.contains('colorized');
    
    if (isColorized) {
        // Remove colors from both previews
        [originalSvgPreview, processedSvgPreview].forEach(preview => {
            preview.classList.remove('colorized');
            const paths = preview.querySelectorAll('path');
            paths.forEach(path => {
                const pathId = path.id || path.getAttribute('data-path-id');
                const colors = preview === originalSvgPreview ? originalColors : processedColors;
                const originalColor = colors.get(pathId);
                if (originalColor) {
                    path.style.fill = originalColor.fill;
                    path.style.stroke = originalColor.stroke;
                }
            });
        });
        colorizeBtn.classList.remove('active');
    } else {
        // Add colors to both previews
        [originalSvgPreview, processedSvgPreview].forEach(preview => {
            preview.classList.add('colorized');
            const paths = preview.querySelectorAll('path');
            const colors = preview === originalSvgPreview ? originalColors : processedColors;
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
        });
        colorizeBtn.classList.add('active');
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
    
    // Display formatted code
    originalSvgCode.textContent = formatSvgCode(svgContent);
    
    // Setup path highlighting
    setupPathHighlighting();
    
    // Reset zoom
    resetZoom('original');

    // Show reset button
    resetBtn.style.display = 'block';
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

// Reset website state
function resetWebsite() {
    // Clear file input
    fileInput.value = '';
    
    // Reset previews
    originalSvgPreview.innerHTML = '<p class="preview-placeholder">Upload an SVG file to see preview</p>';
    processedSvgPreview.innerHTML = '<p class="preview-placeholder">Processed SVG will appear here</p>';
    
    // Clear code sections
    originalSvgCode.textContent = '';
    processedSvgCode.textContent = '';
    
    // Reset zoom
    originalScale = 1;
    processedScale = 1;
    
    // Reset colors
    originalColors.clear();
    processedColors.clear();
    
    // Remove colorize active state
    colorizeBtn.classList.remove('active');
    originalSvgPreview.classList.remove('colorized');
    processedSvgPreview.classList.remove('colorized');
    
    // Reset highlighted path
    highlightedPath = null;

    // Hide reset button
    resetBtn.style.display = 'none';
}

// Copy processed SVG code
async function copyProcessedCode() {
    try {
        await navigator.clipboard.writeText(processedSvgCode.textContent);
        copyProcessedBtn.classList.add('copied');
        copyProcessedBtn.textContent = 'Copied!';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyProcessedBtn.classList.remove('copied');
            copyProcessedBtn.textContent = 'Copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// Add event listeners
colorizeBtn.addEventListener('click', toggleColorize);
resetBtn.addEventListener('click', resetWebsite);
copyProcessedBtn.addEventListener('click', copyProcessedCode);