  // Register Service Worker for PWA (makes the app downloadable & offline-capable)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.log('Service Worker Failed', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const clientInput = document.getElementById('clientName');
  const itemInput = document.getElementById('itemDescription');
  const amountInput = document.getElementById('amount');
  const generateBtn = document.getElementById('generateBtn');

  const previewClient = document.getElementById('previewClient');
  const previewItem = document.getElementById('previewItem');
  const previewAmount = document.getElementById('previewAmount');
  const quoteDate = document.getElementById('quoteDate');
  const quoteCard = document.getElementById('quoteCard');
  const canvasOutput = document.getElementById('canvasOutput');

  // Set current date automatically
  const today = new Date();
  const dateString = today.toLocaleDateString('en-GB');
  quoteDate.textContent = dateString;

  generateBtn.addEventListener('click', () => {
    // 1. Update Preview Text
    const clientVal = clientInput.value.trim() || 'Client Name';
    const itemVal = itemInput.value.trim() || 'Service / Item details';
    const amountVal = parseFloat(amountInput.value) || 0;

    previewClient.textContent = clientVal;
    previewItem.textContent = itemVal;
    previewAmount.textContent = `$${amountVal.toFixed(2)}`;

    // 2. Render Card to Canvas
    canvasOutput.innerHTML = ''; // Clear previous canvas

    html2canvas(quoteCard, { scale: 2 }).then(canvas => {
      canvasOutput.appendChild(canvas);
    });
  });
});
