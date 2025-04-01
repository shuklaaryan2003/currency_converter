const BASE_URL = "https://api.frankfurter.app";

// Wait for the DOM to fully load before executing code
document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll(".dropdown select");
  const btn = document.querySelector("form button");
  const fromCurr = document.querySelector(".from select");
  const toCurr = document.querySelector(".to select");
  const msg = document.querySelector(".msg");
  const form = document.querySelector("form");
  const amountInput = document.querySelector(".amount input");

  // Set initial message
  msg.textContent = "Please enter amount and click 'Get Exchange Rate'";

  // Populate dropdowns with currency options
  for (let select of dropdowns) {
    for (let currCode in countryList) {
      let newOption = document.createElement("option");
      newOption.innerText = currCode;
      newOption.value = currCode;
      if (select.name === "from" && currCode === "USD") {
        newOption.selected = "selected";
      } else if (select.name === "to" && currCode === "INR") {
        newOption.selected = "selected";
      }
      select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
      updateFlag(evt.target);
      // Reset message when currency changes
      msg.textContent = "Please enter amount and click 'Get Exchange Rate'";
    });
  }

  const formatCurrency = (number) => {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const updateExchangeRate = async () => {
    let amount = amountInput.value;
    if (amount === "" || amount <= 0) {
      amount = 1;
      amountInput.value = "1";
    }
    
    try {
      msg.textContent = "Fetching exchange rate...";
      const fromCurrency = fromCurr.value;
      const toCurrency = toCurr.value;

      // If currencies are the same, display direct conversion
      if (fromCurrency === toCurrency) {
        msg.textContent = `${formatCurrency(parseFloat(amount))} ${fromCurrency} = ${formatCurrency(parseFloat(amount))} ${toCurrency}`;
        return;
      }
      
      const URL = `${BASE_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`;
      const response = await fetch(URL);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data && data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency] / amount;
        const finalAmount = data.rates[toCurrency];
        
        // Main conversion display
        msg.textContent = `${formatCurrency(parseFloat(amount))} ${fromCurrency} = ${formatCurrency(finalAmount)} ${toCurrency}`;
        
        // Add rate information
        const rateInfo = document.createElement("div");
        rateInfo.textContent = `1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}`;
        rateInfo.style.fontSize = "0.8em";
        rateInfo.style.marginTop = "5px";
        rateInfo.style.color = "#666";
        msg.appendChild(rateInfo);
      } else {
        throw new Error('Invalid exchange rate data');
      }
    } catch (error) {
      console.error("Exchange rate error:", error);
      msg.textContent = "Error fetching exchange rate. Please try again later.";
    }
  };

  const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
  };

  // Only update on form submission (button click)
  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    updateExchangeRate();
  });

  // Swap currencies without triggering update
  const swapButton = document.querySelector(".fa-arrow-right-arrow-left");
  swapButton.addEventListener("click", (evt) => {
    evt.preventDefault();
    const tempCode = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempCode;
    updateFlag(fromCurr);
    updateFlag(toCurr);
    // Reset message when currencies are swapped
    msg.textContent = "Please enter amount and click 'Get Exchange Rate'";
  });

  // Initialize flags
  updateFlag(fromCurr);
  updateFlag(toCurr);
});


