// ===== 1. SELECT ELEMENTS FROM THE PAGE =====
// Navigation and theme
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const themeBtn = document.getElementById('themeBtn');
 
// Budget tracker
const budgetDisplay = document.getElementById('budgetDisplay');
const spentDisplay = document.getElementById('spentDisplay');
const remainingDisplay = document.getElementById('remainingDisplay');
const progressBar = document.getElementById('progressBar');
const budgetMessage = document.getElementById('budgetMessage');
const budgetForm = document.getElementById('budgetForm');
const budgetInput = document.getElementById('budgetInput');
const expenseForm = document.getElementById('expenseForm');
const expenseDesc = document.getElementById('expenseDesc');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expenseError = document.getElementById('expenseError');
const filterCategory = document.getElementById('filterCategory');
const expenseList = document.getElementById('expenseList');
 
// Bill splitter
const splitForm = document.getElementById('splitForm');
const billAmount = document.getElementById('billAmount');
const peopleCount = document.getElementById('peopleCount');
const tipPercent = document.getElementById('tipPercent');
const splitResult = document.getElementById('splitResult');
 
// Contact form
const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const formSuccess = document.getElementById('formSuccess');
// ===== 2. DATA (loaded from the browser's storage) =====
let budget = Number(localStorage.getItem('perawise-budget')) || 0;
let expenses = JSON.parse(localStorage.getItem('perawise-expenses')) || [];
 
// Save the current data so it is still here after a refresh
function saveData() {
  localStorage.setItem('perawise-budget', budget);
  localStorage.setItem('perawise-expenses', JSON.stringify(expenses));
}
 
// Turns 1250 into "₱1,250.00"
function formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}
// ===== 3. UPDATE THE BUDGET SUMMARY =====
function updateSummary() {
  // Add up every expense amount
  const spent = expenses.reduce(function (sum, item) {
    return sum + item.amount;
  }, 0);
  const remaining = budget - spent;
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
 
  // Show the numbers
  budgetDisplay.textContent = formatPeso(budget);
  spentDisplay.textContent = formatPeso(spent);
  remainingDisplay.textContent = formatPeso(remaining);
  remainingDisplay.classList.toggle('negative', remaining < 0);
 
  // Resize and recolor the progress bar
  progressBar.style.width = percent + '%';
  progressBar.classList.remove('warning', 'danger');
 
  // Show a helpful message
  if (budget === 0) {
    budgetMessage.textContent = 'Set a budget to start tracking your spending.';
  } else if (spent > budget) {
    progressBar.classList.add('danger');
    budgetMessage.textContent = 'Over budget by ' + formatPeso(spent - budget) + '. Time to cut back!';
  } else if (percent >= 80) {
    progressBar.classList.add('warning');
    budgetMessage.textContent = 'Careful! You have used ' + Math.round(percent) + '% of your budget.';
  } else {
    budgetMessage.textContent = 'You are on track. Keep it up!';
  }
}
// ===== 4. SHOW THE EXPENSES ON THE PAGE =====
function renderExpenses() {
  // Keep only the expenses that match the selected category
  const selected = filterCategory.value;
  const visible = expenses.filter(function (item) {
    return selected === 'All' || item.category === selected;
  });
 
  expenseList.innerHTML = '';   // clear the old list
 
  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No expenses to show yet.';
    expenseList.appendChild(empty);
    return;
  }
 
  // Build one <li> for every expense
  visible.forEach(function (item) {
    const li = document.createElement('li');
    li.className = 'expense-item';
 
    const info = document.createElement('div');
    info.className = 'expense-info';
 
    const title = document.createElement('strong');
    title.textContent = item.description;
 
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = item.category + ' • ' + item.date;
 
    info.append(title, meta);
 
    const amount = document.createElement('span');
    amount.className = 'expense-amount';
    amount.textContent = formatPeso(item.amount);
 
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = item.id;
    deleteBtn.textContent = 'Delete';
 
    li.append(info, amount, deleteBtn);
    expenseList.appendChild(li);
  });
}
// ===== 5. SAVE THE BUDGET =====
budgetForm.addEventListener('submit', function (event) {
  event.preventDefault();               // stop the page from reloading
 
  const value = parseFloat(budgetInput.value);
 
  if (isNaN(value) || value <= 0) {
    alert('Please enter a budget greater than zero.');
    return;
  }
 
  budget = value;
  saveData();
  updateSummary();
  budgetForm.reset();
});
// ===== 6. ADD AN EXPENSE =====
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();
 
  const description = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;
 
  // Validate the input
  if (description === '' || isNaN(amount) || amount <= 0) {
    expenseError.textContent = 'Enter a description and an amount greater than zero.';
    return;
  }
  expenseError.textContent = '';
 
  // Create the expense object
  const newExpense = {
    id: Date.now(),                                   // unique number
    description: description,
    amount: amount,
    category: category,
    date: new Date().toLocaleDateString('en-PH')
  };
 
  expenses.unshift(newExpense);          // add to the FRONT of the array
  saveData();
  renderExpenses();
  updateSummary();
  expenseForm.reset();
});
// ===== 7. DELETE AN EXPENSE AND FILTER THE LIST =====
// One listener on the <ul> handles every Delete button (event delegation)
expenseList.addEventListener('click', function (event) {
  if (event.target.classList.contains('delete-btn')) {
    const id = Number(event.target.dataset.id);
 
    expenses = expenses.filter(function (item) {
      return item.id !== id;             // keep everything EXCEPT this one
    });
 
    saveData();
    renderExpenses();
    updateSummary();
  }
});
 
// Redraw the list whenever the filter changes
filterCategory.addEventListener('change', renderExpenses);
// ===== 8. BILL SPLITTER =====
splitForm.addEventListener('submit', function (event) {
  event.preventDefault();
 
  const bill = parseFloat(billAmount.value);
  const people = parseInt(peopleCount.value, 10);
  const tipRate = parseFloat(tipPercent.value) || 0;
 
  if (isNaN(bill) || bill <= 0 || isNaN(people) || people < 1) {
    splitResult.textContent = 'Please enter a valid bill and number of people.';
    return;
  }
 
  const tip = bill * (tipRate / 100);
  const total = bill + tip;
  const perPerson = total / people;
 
  splitResult.textContent =
    `Total with tip: ${formatPeso(total)}  |  Each person pays: ${formatPeso(perPerson)}`;
});
// ===== 9. CONTACT FORM VALIDATION =====
function isValidEmail(email) {
  // text + @ + text + . + text, with no spaces
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
contactForm.addEventListener('submit', function (event) {
  event.preventDefault();
 
  const name = contactName.value.trim();
  const email = contactEmail.value.trim();
  const message = contactMessage.value.trim();
  let isValid = true;
 
  // Clear the old messages first
  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';
 
  if (name.length < 2) {
    nameError.textContent = 'Please enter your name (at least 2 letters).';
    isValid = false;
  }
  if (!isValidEmail(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    isValid = false;
  }
  if (message.length < 10) {
    messageError.textContent = 'Your message should be at least 10 characters.';
    isValid = false;
  }
 
  if (isValid) {
    formSuccess.textContent = `Thank you, ${name}! Your message has been received.`;
    contactForm.reset();
  }
});
// ===== 10. MOBILE MENU AND DARK MODE =====
menuBtn.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});
 
// Close the mobile menu after a link is tapped
navMenu.addEventListener('click', function (event) {
  if (event.target.tagName === 'A') {
    navMenu.classList.remove('open');
  }
});
 
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}
 
themeBtn.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('perawise-theme', isDark ? 'dark' : 'light');
});
// ===== 11. START THE APP =====
applyTheme(localStorage.getItem('perawise-theme') === 'dark');
document.getElementById('year').textContent = new Date().getFullYear();
updateSummary();
renderExpenses();
