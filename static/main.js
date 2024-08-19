function displayFileName() {
    const input = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    fileName.textContent = input.files[0] ? input.files[0].name : '';
    document.getElementById('error-message').textContent = '';
}

document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const input = document.getElementById('file-input');
    const responseMessage = document.getElementById('response-message');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('upload-submit-btn');
    const backlight = document.getElementById('backlight');

    // Check if a file is selected
    if (!input.files.length) {
        errorMessage.textContent = 'Please select a file to upload.';
        backlight.style.display = "flex";
        return;
    }

    // Disable the button and show spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Uploading...';

    const formData = new FormData(this);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status == "ok") {
                responseMessage.textContent = data.message;
                document.getElementById('filecode-message').textContent = `File Download Code: ${data.filecode}`;
                errorMessage.textContent = '';
                backlight.style.display = "flex";
                input.value = '';
                displayFileName();
            } else {
                errorMessage.textContent = data.message;
                responseMessage.textContent = '';
                backlight.style.display = "flex";
            }
            submitBtn.disabled = false; // Re-enable the button
            submitBtn.textContent = 'Upload'; // Reset button text
        })
        .catch(error => {
            errorMessage.textContent = "An error occurred while uploading the file.";
            submitBtn.disabled = false; // Re-enable the button
            submitBtn.textContent = 'Upload'; // Reset button text
            backlight.style.display = "flex";
        });
});

document.getElementById('download-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const input = document.getElementById('download-code');
    const responseMessage = document.getElementById('response-message');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('download-submit-btn');
    const backlight = document.getElementById('backlight');

    // Check if a file is selected
    if (!input.value) {
        errorMessage.textContent = 'Please enter a download code or link!';
        backlight.style.display = "flex";
        return;
    }

    // Disable the button and show spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Downloading...';

    const formData = new FormData(this);

    fetch('/download', {  // Replace with your actual endpoint
        method: 'POST',
        body: formData
    })
        .then(response => {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                // Handle JSON response
                return response.json();
            } else if (contentType && contentType.includes('application/octet-stream')) {
                // Handle file response
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = getFilenameFromContentDisposition(contentDisposition);
                return response.blob().then(blob => ({ blob, filename }));
            } else {
                throw new Error('Unsupported response type');
            }
        })
        .then(data => {
            if (data.blob) {
                // Handle file download
                const url = window.URL.createObjectURL(data.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename; // Use filename from header
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                responseMessage.textContent = "File downloaded successfully!";
                errorMessage.textContent = '';
                backlight.style.display = "flex";
                input.value = '';
                a.remove();
            } else {
                // Handle JSON data
                errorMessage.textContent = data.message;
                backlight.style.display = "flex";
            }
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = "An server error occurred.";
            backlight.style.display = "flex";
            submitBtn.disabled = false;
        });
});

function getFilenameFromContentDisposition(contentDisposition) {
    if (!contentDisposition) {
        return 'downloaded-file';
    }

    // Match filename in various formats
    const filenameMatch = contentDisposition.match(/filename\*=utf-8''(.+)|filename="(.+)"|filename=(.+)/i);

    if (filenameMatch) {
        return filenameMatch[1] || filenameMatch[2] || filenameMatch[3] || 'downloaded-file';
    }

    return 'downloaded-file';
}

function closeBacklight() {
    const backlight = document.getElementById('backlight');
    const responseMessage = document.getElementById('response-message');
    const errorMessage = document.getElementById('error-message');
    const fielCodeMessage = document.getElementById('filecode-message')

    backlight.style.display = "none";
    responseMessage.textContent = '';
    errorMessage.textContent = '';
    fielCodeMessage.textContent = '';
}
