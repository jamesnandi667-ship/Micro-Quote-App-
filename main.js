// Register Service Worker for PWA Installation & Offline Support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then((reg) => {
      console.log('Service Worker Registered');
      reg.update();
    })
    .catch((err) => console.log('Service Worker Failed', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const itemsContainer = document.getElementById('itemsContainer');
  const addItemBtn = document.getElementById('addItemBtn');
  const generateBtn = document.getElementById('generateBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const universalShareBtn = document.getElementById('universalShareBtn');
  const logoInput = document.getElementById('businessLogo');
  const logoPreview = document.getElementById('logoPreview');
  const docTypeSelect = document.getElementById('docTypeSelect');

  // M-Pesa Modal Elements
  const mpesaModal = document.getElementById('mpesaModal');
  const openMpesaModalBtn = document.getElementById('openMpesaModalBtn');
  const closeMpesaModal = document.getElementById('closeMpesaModal');
  const verifyMpesaBtn = document.getElementById('verifyMpesaBtn');

  let itemCounter = 0;
  let isProUser = localStorage.getItem('quickquote_pro') === 'true';

  // Check Pro Status
  function updateProStatusUI() {
    const appBadge = document.getElementById('appBadge');
    if (isProUser && appBadge) {
      appBadge.textContent = 'PRO UNLOCKED';
      appBadge.style.background = '#16a34a';
    }
  }
  updateProStatusUI();

  // Set default current date
  const dateEl = document.getElementById('docDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB');
  }

  // Handle Logo Upload Preview (Pro Feature Check)
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      if (!isProUser) {
        alert('⭐ Logo Upload is a PRO feature! Please upgrade via M-Pesa to add your business logo.');
        logoInput.value = '';
        return;
      }
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (logoPreview) {
            logoPreview.src = event.target.result;
            logoPreview.classList.remove('logo-hide');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Function to create dynamic item row
  function createItemRow() {
    itemCounter++;
    const row = document.createElement('div');
    row.className = 'item-row';
    row.id = `item-row-${itemCounter}`;
    row.innerHTML = `
      <input type="text" placeholder="Item description" class="item-desc">
      <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
      <input type="number" placeholder="Price" class="item-price" value="0" min="0">
      <button type="button" class="btn-remove">✕</button>
    `;

    row.querySelector('.btn-remove').addEventListener('click', () => {
      row.remove();
    });

    itemsContainer.appendChild(row);
  }

  if (itemsContainer) {
    createItemRow();
  }

  if (addItemBtn) {
    addItemBtn.addEventListener('click', (e) => {
      e.preventDefault();
      createItemRow();
    });
  }

  // Generate Document
  if (generateBtn) {
    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const docType = docTypeSelect ? docTypeSelect.value : 'QUOTATION';
      const bName = document.getElementById('businessName')?.value.trim() || 'Your Business Name';
      const payInfo = document.getElementById('paymentDetails')?.value.trim();
      const cName = document.getElementById('clientName')?.value.trim() || 'Client Name';
      const currency = document.getElementById('currencySelect')?.value || 'KSh';
      const taxRate = parseFloat(document.getElementById('taxRate')?.value) || 0;
      const discountRate = parseFloat(document.getElementById('discountRate')?.value) || 0;

      // Update Header
      document.getElementById('docTypeTitle').textContent = docType;
      document.getElementById('docBusinessName').textContent = bName;
      document.getElementById('docPaymentInfo').textContent = payInfo ? `Payment: ${payInfo}` : '';
      document.getElementById('docClientName').textContent = cName;

      // Process Table Items
      const docTableBody = document.getElementById('docTableBody');
      if (docTableBody) {
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

        const taxAmount = (subtotal * taxRate) / 100;
        const discountAmount = (subtotal * discountRate) / 100;
        const grandTotal = subtotal + taxAmount - discountAmount;

        document.getElementById('docSubtotal').textContent = `${currency} ${subtotal.toFixed(2)}`;
        document.getElementById('docTax').textContent = `${currency} ${taxAmount.toFixed(2)}`;
        document.getElementById('docDiscount').textContent = `${currency} ${discountAmount.toFixed(2)}`;
        document.getElementById('docGrandTotal').textContent = `${currency} ${grandTotal.toFixed(2)}`;
      }

      document.querySelector('.preview-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Universal Web Share API (Shares to ALL phone apps)
  if (universalShareBtn) {
    universalShareBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const docType = document.getElementById('docTypeTitle')?.textContent || 'Document';
      const cName = document.getElementById('docClientName')?.textContent || 'Client';
      const total = document.getElementById('docGrandTotal')?.textContent || '0.00';
      const bName = document.getElementById('docBusinessName')?.textContent || 'Business';

      const shareData = {
        title: `${docType} from ${bName}`,
        text: `Hi ${cName}, here is your official ${docType} from ${bName}.\n\n*Grand Total:* ${total}\n\nThank you for choosing us!`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log('Shared successfully');
        } catch (err) {
          console.log('Error sharing:', err);
        }
      } else {
        // Fallback for older browsers
        const fallbackText = encodeURIComponent(shareData.text);
        window.open(`https://wa.me/?text=${fallbackText}`, '_blank');
      }
    });
  }

  // Download PDF Action
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const element = document.getElementById('quoteDocument');
      if (typeof html2pdf !== 'undefined' && element) {
        const opt = {
          margin:       0.5,
          filename:     'QuickQuote_Document.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
      } else {
        alert('PDF generator is readying. Please try again in 2 seconds.');
      }
    });
  }

  // M-Pesa Modal Triggering
  if (openMpesaModalBtn && mpesaModal) {
    openMpesaModalBtn.addEventListener('click', () => {
      mpesaModal.style.display = 'flex';
    });
  }

  if (closeMpesaModal && mpesaModal) {
    closeMpesaModal.addEventListener('click', () => {
      mpesaModal.style.display = 'none';
    });
  }

  // Verify M-Pesa Code & Unlock Pro
  if (verifyMpesaBtn) {
    verifyMpesaBtn.addEventListener('click', () => {
      const code = document.getElementById('mpesaCodeInput')?.value.trim();
      if (code && code.length >= 8) {
        localStorage.setItem('quickquote_pro', 'true');
        isProUser = true;
        updateProStatusUI();
        alert('🎉 M-Pesa Payment Verified! All PRO features are now UNLOCKED on your device.');
        if (mpesaModal) mpesaModal.style.display = 'none';
      } else {
        alert('Please enter a valid 10-character M-Pesa transaction code (e.g., QX12345678).');
      }
    });
  }
});
