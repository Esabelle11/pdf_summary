const API_URL = "http://localhost:8000";

let selectedFile = null;

// File input and upload box elements
const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const selectFileBtn = document.getElementById("selectFileBtn");
const fileNameDisplay = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");
const errorMsg = document.getElementById("errorMsg");
const resultsDiv = document.getElementById("results");

// Click on upload box to select file
uploadBox.addEventListener("click", () => {
    fileInput.click();
});

selectFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Drag and drop
uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("drag-over");
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("drag-over");
});

uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
        handleFileSelect(file);
    } else {
        showError("Please upload a PDF file");
    }
});

function handleFileSelect(file) {
    if (file.type !== "application/pdf") {
        showError("Please select a PDF file");
        return;
    }
    
    selectedFile = file;
    fileNameDisplay.textContent = `📁 Selected: ${file.name}`;
    analyzeBtn.disabled = false;
    clearError();
}

// Analyze button
analyzeBtn.addEventListener("click", analyzeDocument);

// Reset button
resetBtn.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    fileNameDisplay.textContent = "";
    resultsDiv.style.display = "none";
    analyzeBtn.disabled = true;
    clearError();
});

async function analyzeDocument() {
    if (!selectedFile) {
        showError("Please select a PDF file");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Show loading state
    analyzeBtn.disabled = true;
    document.getElementById("btnText").style.display = "none";
    document.getElementById("btnSpinner").style.display = "inline-block";

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to analyze document");
        }

        const data = await response.json();
        displayResults(data);
        clearError();
    } catch (error) {
        console.error("Error:", error);
        showError(error.message || "Failed to analyze document. Please try again.");
    } finally {
        analyzeBtn.disabled = false;
        document.getElementById("btnText").style.display = "inline";
        document.getElementById("btnSpinner").style.display = "none";
    }
}

function displayResults(data) {
    // Display summary
    document.getElementById("summaryText").textContent = data.summary;

    // Display keywords
    const keywordsList = document.getElementById("keywordsList");
    keywordsList.innerHTML = "";
    if (Array.isArray(data.keywords) && data.keywords.length > 0) {
        data.keywords.forEach((keyword) => {
            const tag = document.createElement("span");
            tag.className = "keyword-tag";
            tag.textContent = keyword;
            keywordsList.appendChild(tag);
        });
    } else {
        keywordsList.textContent = "No keywords extracted";
    }

    // Display text length
    document.getElementById("textLength").textContent = data.text_length.toLocaleString();

    // Show results
    resultsDiv.style.display = "block";
    window.scrollTo({ top: resultsDiv.offsetTop - 100, behavior: "smooth" });
}

function showError(message) {
    errorMsg.textContent = "❌ " + message;
    errorMsg.style.display = "block";
}

function clearError() {
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
}
