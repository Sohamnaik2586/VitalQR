// Form Submission Logic
const form = document.getElementById('generateForm');
const qrCodeContainer = document.getElementById('qrCodeContainer');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const data = {
        name: form.name.value,
        age: form.age.value,
        bloodGroup: form.bloodGroup.value,
        medicalConditions: form.medicalConditions.value,
        allergies: form.allergies.value,
        emergencyContact: form.emergencyContact.value,
    };

    try {
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            qrCodeContainer.innerHTML = `<img src="${result.qrCodeUrl}" alt="Generated QR Code">`;
        } else {
            alert(result.message || 'Error generating QR code');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred while generating the QR code.');
    }
});
