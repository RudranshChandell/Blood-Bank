// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('pdf-upload');
const scanningOverlay = document.getElementById('scanning-overlay');
const registrationForm = document.getElementById('registration-form');
const toast = document.getElementById('toast');

// --- Drag & Drop Event Listeners ---
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handlePDF(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handlePDF(e.target.files[0]);
    }
});

// --- PDF Processing Logic ---
async function handlePDF(file) {
    scanningOverlay.classList.remove('hidden');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
        }

        console.log('Extracted Text:', fullText);
        
        // Short delay to simulate "AI processing" and show the animation
        setTimeout(() => {
            const parsedData = parsePatientData(fullText);
            populateForm(parsedData);
            scanningOverlay.classList.add('hidden');
            showToast('PDF Scanned & Form Filled!');
        }, 2000);

    } catch (error) {
        console.error('Error parsing PDF:', error);
        scanningOverlay.classList.add('hidden');
        alert('Failed to parse PDF. Please ensure it is a valid document.');
    }
}

// --- Data Parsing Logic (Regex Based) ---
function parsePatientData(text) {
    const data = {
        name: '',
        age: '',
        gender: '',
        bloodGroup: '',
        contact: '',
        id: ''
    };

    // Name patterns
    const nameMatch = text.match(/(?:Name|Patient|Full Name)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/i);
    if (nameMatch) data.name = nameMatch[1].trim();

    // Age patterns
    const ageMatch = text.match(/(?:Age|Years)[:\s]+(\d{1,3})/i);
    if (ageMatch) data.age = ageMatch[1];

    // Gender patterns
    if (/\b(?:Male|M|Man)\b/i.test(text)) data.gender = 'male';
    else if (/\b(?:Female|F|Woman)\b/i.test(text)) data.gender = 'female';

    // Blood Group patterns
    const bloodMatch = text.match(/\b([ABO][+-])\b/i);
    if (bloodMatch) data.bloodGroup = bloodMatch[1].toUpperCase();
    else {
        // Look for "Blood Group: A+" style
        const bgMatch = text.match(/(?:Blood Group|Type)[:\s]+([ABO][+-])/i);
        if (bgMatch) data.bloodGroup = bgMatch[1].toUpperCase();
    }

    // Contact pattern (simple phone regex)
    const phoneMatch = text.match(/(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/);
    if (phoneMatch) data.contact = phoneMatch[1].trim();

    // ID pattern
    const idMatch = text.match(/(?:ID|Gov ID|Patient ID)[:\s]+([A-Z0-9-]+)/i);
    if (idMatch) data.id = idMatch[1];

    return data;
}

// --- Form Population ---
function populateForm(data) {
    if (data.name) document.getElementById('full-name').value = data.name;
    if (data.age) document.getElementById('age').value = data.age;
    if (data.gender) document.getElementById('gender').value = data.gender;
    if (data.bloodGroup) document.getElementById('blood-group').value = data.bloodGroup;
    if (data.contact) document.getElementById('contact').value = data.contact;
    if (data.id) document.getElementById('id-number').value = data.id;
}

// --- UI Feedback ---
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Form Submission handling
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Patient Registered Successfully!');
    registrationForm.reset();
});
