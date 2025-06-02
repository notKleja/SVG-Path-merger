// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultsContainer = document.getElementById('resultsContainer');

// Event Listeners
uploadBtn.addEventListener('click', handleFileUpload);
fileInput.addEventListener('change', handleFileSelection);

// Handle file selection
function handleFileSelection(event) {
    const files = event.target.files;
    if (files.length > 0) {
        displaySelectedFiles(files);
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