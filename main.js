document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("dateDisplay");
  if (dateDisplay) {
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString();
  }

  const generateBtn = document.getElementById("generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", buildPreview);
  }
});

function buildPreview() {
  const clientVal = document.getElementById("clientInput").value.trim() || "N/A";
  const itemVal = document.getElementById("itemInput").value.trim() || "N/A";
  const rawAmount = document.getElementById("amountInput").value;
  const parsedAmount = parseFloat(rawAmount);
  const formattedAmount = isNaN(parsedAmount) ? "0.00" : parsedAmount.toFixed(2);

  document.getElementById("clientDisplay").textContent = clientVal;
  document.getElementById("itemDisplay").textContent = itemVal;
  document.getElementById("amountDisplay").textContent = formattedAmount;

  const quoteCard = document.getElementById("quoteCard");
  const previewArea = document.getElementById("previewArea");

  if (!quoteCard || !previewArea) {
    console.error("Required DOM elements are missing.");
    return;
  }

  html2canvas(quoteCard, {
    scale: 2,
    useCORS: true,
    logging: false
  }).then((canvas) => {
    previewArea.innerHTML = "";
    previewArea.appendChild(canvas);
  }).catch((err) => {
    console.error("html2canvas error:", err);
    alert("Error rendering image preview.");
  });
    }
