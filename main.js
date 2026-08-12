// Change "receipt-container" to your actual class name (keep the dot!)
const receiptElement = document.querySelector('.receipt-container'); 

if (receiptElement) {
  html2canvas(receiptElement, {
    useCORS: true,
    scale: 2
  }).then(canvas => {
    const previewContainer = document.querySelector('.preview-area'); // or getElementById('preview')
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.appendChild(canvas);
    }
  }).catch(err => {
    console.error("Rendering error:", err);
  });
} else {
  console.error("Could not find the receipt element to render!");
}window.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Read input values safely
            const businessName = document.getElementById('businessName').value || 'My Business';
            const sellerPhone = document.getElementById('sellerPhone').value || 'N/A';
            const clientName = document.getElementById('clientName').value || 'Valued Customer';
            const itemDesc = document.getElementById('itemDesc').value || 'Product / Service';
            
            const rawQty = document.getElementById('itemQty').value;
            const rawPrice = document.getElementById('itemPrice').value;
            
            const itemQty = parseFloat(rawQty) || 1;
            const itemPrice = parseFloat(rawPrice) || 0;
            const paymentMethod = document.getElementById('paymentMethod').value || 'Pending';

            // Calculate Total
            const totalAmount = (itemQty * itemPrice).toFixed(2);

            // Populate Receipt Card Elements
            document.getElementById('prevBusiness').textContent = businessName;
            document.getElementById('prevPhone').textContent = sellerPhone;
            document.getElementById('prevCustomer').textContent = clientName;
            document.getElementById('prevItem').textContent = itemDesc;
            document.getElementById('prevQtyPrice').textContent = `${itemQty} x $${itemPrice.toFixed(2)}`;
            document.getElementById('prevTotal').textContent = `$${totalAmount}`;
            document.getElementById('prevPayment').textContent = paymentMethod;

            // Make Receipt Visible
            const receiptPreview = document.getElementById('receiptPreview');
            if (receiptPreview) {
                receiptPreview.style.display = 'block';
                receiptPreview.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});// Select Form Inputs & Button
const generateBtn = document.getElementById('generateBtn');

generateBtn.addEventListener('click', () => {
    // Get Input Values
    const businessName = document.getElementById('businessName').value || 'My Business';
    const sellerPhone = document.getElementById('sellerPhone').value || 'N/A';
    const clientName = document.getElementById('clientName').value || 'Valued Customer';
    const itemDesc = document.getElementById('itemDesc').value || 'Product / Service';
    const itemQty = parseFloat(document.getElementById('itemQty').value) || 1;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value || 'Pending';

    // Calculate Total
    const totalAmount = (itemQty * itemPrice).toFixed(2);

    // Update Receipt Card Elements
    document.getElementById('prevBusiness').innerText = businessName;
    document.getElementById('prevPhone').innerText = sellerPhone;
    document.getElementById('prevCustomer').innerText = clientName;
    document.getElementById('prevItem').innerText = itemDesc;
    document.getElementById('prevQtyPrice').innerText = `${itemQty} x $${itemPrice.toFixed(2)}`;
    document.getElementById('prevTotal').innerText = `$${totalAmount}`;
    document.getElementById('prevPayment').innerText = paymentMethod;

    // Show the Receipt Section
    const receiptPreview = document.getElementById('receiptPreview');
    receiptPreview.style.display = 'block';

    // Smooth scroll down to the receipt
    receiptPreview.scrollIntoView({ behavior: 'smooth' });
});
