// Register Service Worker for PWA Installation & Offline Support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.log('Service Worker Failed', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const itemsContainer = document.getElementById('itemsContainer');
  const addItemBtn = document.getElementById('addItemBtn');
  const generateBtn = document.getElementById('generateBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const logoInput = document.getElementById('businessLogo');
  const logoPreview = document.getElementById('logoPreview');

  let itemCounter = 0;
  let logoBase64 = '';

  // Set default current date
  document.getElementById('docDate').textContent = new Date().toLocaleDateString('en-GB');

  // Handle Logo Upload Preview
  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        logoBase64 = event.target.result;
        logoPreview.src = logoBase64;
        logoPreview.classList.remove('logo-hide');
      };
      reader.readAsDataURL(file);
    }
  });

  // Function to create dynamic row
  function createItemRow() {
    itemCounter++;
    const row = document.createElement('div');
    row.className = 'item-row';
    row.id = `item-row-${itemCounter}`;
    row.innerHTML = `
      <input type="text" placeholder="Item description" class="item-desc">
      <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
      <input type="number" placeholder="Price" class="item-price" value="0" min="0">
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    itemsContainer.appendChild(row);
  }

  // Add initial item row on load
  createItemRow();
  addItemBtn.addEventListener('click', createItemRow);

  // Generate Quotation Action
  generateBtn.addEventListener('click', () => {
    const bName = document.getElementById('businessName').value.trim() || 'Your Business Name';
    const payInfo = document.getElementById('paymentDetails').value.trim();
    const cName = document.getElementById('clientName').value.trim() || 'Client Name';
    const currency = document.getElementById('currencySelect').value;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;

    // Render Header Info
    document.getElementById('docBusinessName').textContent = bName;
    document.getElementById('docPaymentInfo').textContent = payInfo ? `Payment: ${payInfo}` : '';
    document.getElementById('docClientName').textContent = cName;

    // Process Table Items
    const docTableBody = document.getElementById('docTableBody');
    docTableBody.innerHTML = '';

    const rows = itemsContainer.querySelectorAll('.item-row');
    let subtotal = 0;

    rows.forEach(row => {
      const desc = row.querySelector('.item-desc').value.trim() || 'Service / Product';
      const qty = parseFloat(row.querySelector('.item-qty').value) || 1;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const rowTotal = qty * price;
      subtotal += rowTotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${desc}</td>
        <td>${qty}</td>
        <td>${currency} ${price.toFixed(2)}</td>
        <td>${currency} ${rowTotal.toFixed(2)}</td>
      `;
      docTableBody.appendChild(tr);
    });

    // Calculate Totals
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    document.getElementById('docSubtotal').textContent = `${currency} ${subtotal.toFixed(2)}`;
    document.getElementById('docTax').textContent = `${currency} ${taxAmount.toFixed(2)}`;
    document.getElementById('docGrandTotal').textContent = `${currency} ${grandTotal.toFixed(2)}`;

    // Scroll smoothly to preview
    document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Download PDF Action
  downloadPdfBtn.addEventListener('click', () => {
    const element = document.getElementById('quoteDocument');
    const opt = {
      margin:       0.5,
      filename:     'Quotation_QuickQuote.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  });

  // Share via WhatsApp Action
  whatsappBtn.addEventListener('click', () => {
    const cName = document.getElementById('docClientName').textContent;
    const total = document.getElementById('docGrandTotal').textContent;
    const bName = document.getElementById('docBusinessName').textContent;

    const text = `Hi ${cName}, here is your official quotation from ${bName}.\n\n*Grand Total:* ${total}\n\nThank you for doing business with us!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
});
