// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=5')
    .then((reg) => reg.update())
    .catch((err) => console.log('SW Error:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  let itemCounter = 0;
  let isProUser = localStorage.getItem('quickquote_pro') === 'true';

  // UI Element References
  const itemsContainer = document.getElementById('itemsContainer');
  const addItemBtn = document.getElementById('addItemBtn');
  const generateBtn = document.getElementById('generateBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const universalShareBtn = document.getElementById('universalShareBtn');
  const logoInput = document.getElementById('businessLogo');
  const logoPreview = document.getElementById('logoPreview');
  const docTypeSelect = document.getElementById('docTypeSelect');

  // Modal References
  const mpesaModal = document.getElementById('mpesaModal');
  const openMpesaModalBtn = document.getElementById('openMpesaModalBtn');
  const closeMpesaModal = document.getElementById('closeMpesaModal');
  const verifyMpesaBtn = document.getElementById('verifyMpesaBtn');

  // Update Pro Badge
  const updateProUI = () => {
    const badge = document.getElementById('appBadge');
    if (badge && isProUser) {
      badge.textContent = 'PRO UNLOCKED';
      badge.style.background = '#16a34a';
    }
  };
  updateProUI();

  // Set Today's Date
  const dateEl = document.getElementById('docDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB');

  // Function to Add Dynamic Item Rows
  const createItemRow = () => {
    itemCounter++;
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" placeholder="Item description" class="item-desc">
      <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
      <input type="number" placeholder="Price" class="item-price" value="0" min="0">
      <button type="button" class="btn-remove">✕</button>
    `;

    row.querySelector('.btn-remove').onclick = () => row.remove();
    if (itemsContainer) itemsContainer.appendChild(row);
  };

  // Create initial row on load
  createItemRow();

  // Add Item Button Event
  if (addItemBtn) {
    addItemBtn.onclick = (e) => {
      e.preventDefault();
      createItemRow();
    };
  }

  // Logo Upload Handler
  if (logoInput) {
    logoInput.onchange = (e) => {
      if (!isProUser) {
        alert('⭐ Logo Upload is a PRO feature! Upgrade via M-Pesa to unlock.');
        logoInput.value = '';
        return;
      }
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (logoPreview) {
            logoPreview.src = evt.target.result;
            logoPreview.classList.remove('logo-hide');
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }

  // Generate Quotation / Document Action
  if (generateBtn) {
    generateBtn.onclick = (e) => {
      e.preventDefault();

      const docType = docTypeSelect ? docTypeSelect.value : 'QUOTATION';
      const bName = document.getElementById('businessName')?.value.trim() || 'Your Business Name';
      const payInfo = document.getElementById('paymentDetails')?.value.trim();
      const cName = document.getElementById('clientName')?.value.trim() || 'Client Name';
      const currency = document.getElementById('currencySelect')?.value || 'KSh';
      const taxRate = parseFloat(document.getElementById('taxRate')?.value) || 0;
      const discountRate = parseFloat(document.getElementById('discountRate')?.value) || 0;

      // Update Header Text
      document.getElementById('docTypeTitle').textContent = docType;
      document.getElementById('docBusinessName').textContent = bName;
      document.getElementById('docPaymentInfo').textContent = payInfo ? `Payment: ${payInfo}` : '';
      document.getElementById('docClientName').textContent = cName;

      // Process Table Items
      const docTableBody = document.getElementById('docTableBody');
      if (docTableBody && itemsContainer) {
        docTableBody.innerHTML = '';
        const rows = itemsContainer.querySelectorAll('.item-row');
        let subtotal = 0;

        rows.forEach((row) => {
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
    };
  }

  // Native Web Share API
  if (universalShareBtn) {
    universalShareBtn.onclick = async (e) => {
      e.preventDefault();
      const docType = document.getElementById('docTypeTitle')?.textContent || 'Document';
      const cName = document.getElementById('docClientName')?.textContent || 'Client';
      const total = document.getElementById('docGrandTotal')?.textContent || '0.00';
      const bName = document.getElementById('docBusinessName')?.textContent || 'Business';

      const shareText = `Hi ${cName}, here is your official ${docType} from ${bName}.\n\n*Grand Total:* ${total}\n\nThank you!`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${docType} - ${bName}`,
            text: shareText,
            url: window.location.href
          });
        } catch (err) {
          console.log('Share canceled or failed:', err);
        }
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    };
  }

  // PDF Export Action
  if (downloadPdfBtn) {
    downloadPdfBtn.onclick = (e) => {
      e.preventDefault();
      const element = document.getElementById('quoteDocument');
      if (typeof html2pdf !== 'undefined' && element) {
        html2pdf().set({
          margin: 0.5,
          filename: 'QuickQuote_Document.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(element).save();
      } else {
        window.print();
      }
    };
  }

  // M-Pesa Modal Toggle & Activate
  if (openMpesaModalBtn && mpesaModal) {
    openMpesaModalBtn.onclick = () => mpesaModal.style.display = 'flex';
  }
  if (closeMpesaModal && mpesaModal) {
    closeMpesaModal.onclick = () => mpesaModal.style.display = 'none';
  }
  if (verifyMpesaBtn) {
    verifyMpesaBtn.onclick = () => {
      const code = document.getElementById('mpesaCodeInput')?.value.trim();
      if (code && code.length >= 8) {
        localStorage.setItem('quickquote_pro', 'true');
        isProUser = true;
        updateProUI();
        alert('🎉 M-Pesa Code Verified! PRO features are now active.');
        if (mpesaModal) mpesaModal.style.display = 'none';
      } else {
        alert('Please enter a valid M-Pesa transaction code.');
      }
    };
  }
});
