let incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];
let expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];

let recurringTransactions = JSON.parse(localStorage.getItem("recurringTransactions")) || [];

function saveData() {
  localStorage.setItem("incomeData", JSON.stringify(incomeData));
  localStorage.setItem("expenseData", JSON.stringify(expenseData));
  localStorage.setItem("recurringTransactions", JSON.stringify(recurringTransactions));
}

function updateDashboard() {

  const totalIncome = incomeData.reduce(
    (total, item) => total + Number(item.amount), 0
  );

  const totalExpense = expenseData.reduce(
    (total, item) => total + Number(item.amount), 0
  );

  const balance = totalIncome - totalExpense;

  document.getElementById("income").textContent =
    "Rs. " + totalIncome.toLocaleString();

  document.getElementById("expense").textContent =
    "Rs. " + totalExpense.toLocaleString();

  document.getElementById("balance").textContent =
    "Rs. " + balance.toLocaleString();

  document.getElementById("saving").textContent =
    "Rs. " + Math.max(balance, 0).toLocaleString();

  updateMonthlySummary();
  showTransactions();
  updateSmartAlerts();
  updateProfessionalKpi();
  updateFinancialHealth2();
  updateHomeHealthUI();
}


function updateMonthlySummary() {

  const now = new Date();

  const currentMonth =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const monthlyIncome = incomeData.filter(item =>
    item.date && item.date.startsWith(currentMonth)
  );

  const monthlyExpense = expenseData.filter(item =>
    item.date && item.date.startsWith(currentMonth)
  );

  const income = monthlyIncome.reduce(
    (total, item) => total + Number(item.amount), 0
  );

  const expense = monthlyExpense.reduce(
    (total, item) => total + Number(item.amount), 0
  );

  const saving = income - expense;

  const savingRate =
    income > 0 ? (saving / income) * 100 : 0;

  const monthlyIncomeEl = document.getElementById("monthlyIncome");
  const monthlyExpenseEl = document.getElementById("monthlyExpense");
  const monthlySavingEl = document.getElementById("monthlySaving");
  const savingRateEl = document.getElementById("savingRate");

  if (monthlyIncomeEl) {
    monthlyIncomeEl.textContent =
      "Rs. " + income.toLocaleString();
  }

  if (monthlyExpenseEl) {
    monthlyExpenseEl.textContent =
      "Rs. " + expense.toLocaleString();
  }

  if (monthlySavingEl) {
    monthlySavingEl.textContent =
      "Rs. " + Math.max(saving, 0).toLocaleString();
  }

  if (savingRateEl) {
    savingRateEl.textContent =
      Math.max(savingRate, 0).toFixed(1) + "%";
  }
}


let currentTransactionType = "";

const incomeCategories = [
  "Salary",
  "Business",
  "Freelance",
  "Investment",
  "Gift",
  "Other"
];

const expenseCategories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Education",
  "Health",
  "Mobile / Internet",
  "Rent",
  "Other"
];

function addIncome() {
  openTransactionModal("income");
}

function addExpense() {
  openTransactionModal("expense");
}

function openTransactionModal(type) {

  currentTransactionType = type;

  const modal = document.getElementById("transactionModal");
  const title = document.getElementById("modalTitle");
  const category = document.getElementById("categoryInput");
  const date = document.getElementById("dateInput");

  title.textContent =
    type === "income" ? "Add Income" : "Add Expense";

  const categories =
    type === "income"
      ? incomeCategories
      : expenseCategories;

  category.innerHTML =
    '<option value="">Select Category</option>';

  categories.forEach(item => {
    category.innerHTML += `
      <option value="${item}">${item}</option>
    `;
  });

  date.value = new Date().toISOString().split("T")[0];

  modal.classList.add("show");
}

function closeModal() {
  document
    .getElementById("transactionModal")
    .classList.remove("show");

  document.getElementById("transactionForm").reset();

window.editingTransaction = null;
  
}

document
  .getElementById("transactionForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const amount =
      Number(document.getElementById("amountInput").value);

    const category =
      document.getElementById("categoryInput").value;

    const date =
      document.getElementById("dateInput").value;

    const note =
      document.getElementById("noteInput").value.trim();

    if (!amount || amount <= 0 || !category || !date) {
      alert("Please complete all required fields.");
      return;
    }

    const transaction = {
      amount: amount,
      category: category,
      date: date,
      note: note || category
    };

    if (window.editingTransaction) {

  const type = window.editingTransaction.type;
  const index = window.editingTransaction.index;

  if (type === "income") {
    incomeData[index] = transaction;
  } else {
    expenseData[index] = transaction;
  }

  window.editingTransaction = null;

} else {

  if (currentTransactionType === "income") {
    incomeData.push(transaction);
  } else {
    expenseData.push(transaction);
  }

}

    saveData();
    updateDashboard();
    updateSmartAlerts();
    closeModal();
  });

function showTransactions() {
  filterTransactions();
}

function filterTransactions() {

  const list =
    document.getElementById("transactionList");

  if (!list) return;

  const search =
    (
      document.getElementById("transactionSearch")?.value
      || ""
    ).toLowerCase().trim();

  const filter =
    document.getElementById("transactionFilter")?.value
    || "all";


  let transactions = [

    ...incomeData.map((item, index) => ({
      ...item,
      type: "income",
      originalIndex: index
    })),

    ...expenseData.map((item, index) => ({
      ...item,
      type: "expense",
      originalIndex: index
    }))

  ];


  transactions = transactions.filter(item => {

    const text =
      `${item.note} ${item.category} ${item.amount} ${item.date}`
      .toLowerCase();

    return (
      text.includes(search) &&
      (
        filter === "all" ||
        item.type === filter
      )
    );

  });


  transactions.reverse();


  const count =
    document.getElementById("transactionCount");

  if (count) {
    count.textContent =
      `${transactions.length} transaction${
        transactions.length === 1 ? "" : "s"
      }`;
  }


  if (transactions.length === 0) {

    list.innerHTML =
      '<p class="empty">No matching transactions.</p>';

    return;
  }


  list.innerHTML =
    transactions.map(item => {

      const isIncome =
        item.type === "income";

      const sign =
        isIncome ? "+" : "-";

      const className =
        isIncome
          ? "income-text"
          : "expense-text";


      return `
        <div class="transaction">

          <div class="transaction-main">

            <strong>
              ${item.category || item.note}
            </strong>

            <small>
              ${item.note || "No note"}
              · ${item.date}
            </small>

          </div>


          <div class="transaction-right">

            <strong class="${className}">
              ${sign} Rs.
              ${Number(item.amount).toLocaleString()}
            </strong>

            <div class="transaction-actions">

              <button
                class="edit-btn"
                onclick="editTransaction(
                  '${item.type}',
                  ${item.originalIndex}
                )"
              >
                ✏️
              </button>

              <button
                class="delete-btn"
                onclick="deleteTransaction(
                  '${item.type}',
                  ${item.originalIndex}
                )"
              >
                🗑️
              </button>

            </div>

          </div>

        </div>
      `;

    }).join("");
}

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  document.getElementById("themeBtn").textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});


function editTransaction(type, index) {

  const data =
    type === "income"
      ? incomeData
      : expenseData;

  const transaction = data[index];

  if (!transaction) {
    alert("Transaction not found.");
    return;
  }


  currentTransactionType = type;


  document.getElementById("modalTitle").textContent =
    type === "income"
      ? "Edit Income"
      : "Edit Expense";


  const category =
    document.getElementById("categoryInput");


  const categories =
    type === "income"
      ? incomeCategories
      : expenseCategories;


  category.innerHTML =
    '<option value="">Select Category</option>';


  categories.forEach(item => {

    category.innerHTML += `
      <option value="${item}">
        ${item}
      </option>
    `;

  });


  document.getElementById("amountInput").value =
    transaction.amount;

  document.getElementById("categoryInput").value =
    transaction.category;

  document.getElementById("dateInput").value =
    transaction.date;

  document.getElementById("noteInput").value =
    transaction.note;


  document
    .getElementById("transactionModal")
    .classList.add("show");


  window.editingTransaction = {
    type: type,
    index: index
  };

}


function deleteTransaction(type, index) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this transaction?"
    );

  if (!confirmed) return;


  if (type === "income") {

    incomeData.splice(index, 1);

  } else {

    expenseData.splice(index, 1);

  }


  saveData();

  updateDashboard();

  updateReports();

  updateBudget();

  filterTransactions();


  alert("Transaction deleted successfully.");
}


// ==========================
// RECURRING TRANSACTIONS
// ==========================

let editingRecurringId = null;

function recurringDate(date) {
  return new Date(date + "T00:00:00");
}

function formatDate(date) {
  const d = date instanceof Date ? date : recurringDate(date);
  return d.toISOString().split("T")[0];
}

function addRecurringInterval(date, frequency) {
  const d = new Date(date);

  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);

  return d;
}

function openRecurringForm(id = null) {
  editingRecurringId = id;

  const modal = document.getElementById("recurringModal");
  const form = document.getElementById("recurringForm");
  if (!modal || !form) return;

  form.reset();

  const title = document.getElementById("recurringModalTitle");

  if (id !== null) {
    const item = recurringTransactions.find(x => x.id === id);
    if (!item) return;

    document.getElementById("recurringType").value = item.type;
    document.getElementById("recurringAmount").value = item.amount;
    document.getElementById("recurringCategory").value = item.category;
    document.getElementById("recurringFrequency").value = item.frequency;
    document.getElementById("recurringStartDate").value = item.startDate;
    document.getElementById("recurringEndDate").value = item.endDate || "";
    document.getElementById("recurringNote").value = item.note || "";

    if (title) title.textContent = "Edit Recurring Transaction";
  } else {
    document.getElementById("recurringStartDate").value =
      formatDate(new Date());
    if (title) title.textContent = "Add Recurring Transaction";
  }

  updateRecurringCategoryOptions();
  if (id !== null) {
    const item = recurringTransactions.find(x => x.id === id);
    if (item) document.getElementById("recurringCategory").value = item.category;
  }

  modal.classList.add("show");
}

function closeRecurringForm() {
  const modal = document.getElementById("recurringModal");
  const form = document.getElementById("recurringForm");

  if (modal) modal.classList.remove("show");
  if (form) form.reset();

  editingRecurringId = null;
}

function updateRecurringCategoryOptions() {
  const type = document.getElementById("recurringType")?.value;
  const select = document.getElementById("recurringCategory");
  if (!select) return;

  const categories =
    type === "income" ? incomeCategories : expenseCategories;

  const oldValue = select.value;

  select.innerHTML =
    '<option value="">Select Category</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");

  if (categories.includes(oldValue)) select.value = oldValue;
}

document.getElementById("recurringType")?.addEventListener(
  "change",
  updateRecurringCategoryOptions
);

document.getElementById("recurringForm")?.addEventListener(
  "submit",
  function(event) {
    event.preventDefault();

    const type = document.getElementById("recurringType").value;
    const amount = Number(document.getElementById("recurringAmount").value);
    const category = document.getElementById("recurringCategory").value;
    const frequency = document.getElementById("recurringFrequency").value;
    const startDate = document.getElementById("recurringStartDate").value;
    const endDate = document.getElementById("recurringEndDate").value;
    const note = document.getElementById("recurringNote").value.trim();

    if (!type || !amount || amount <= 0 || !category || !frequency || !startDate) {
      alert("Please complete all required fields.");
      return;
    }

    if (endDate && endDate < startDate) {
      alert("End date cannot be before start date.");
      return;
    }

    if (editingRecurringId !== null) {
      const item = recurringTransactions.find(x => x.id === editingRecurringId);

      if (!item) {
        alert("Recurring transaction not found.");
        return;
      }

      item.type = type;
      item.amount = amount;
      item.category = category;
      item.frequency = frequency;
      item.startDate = startDate;
      item.endDate = endDate;
      item.note = note;
    } else {
      recurringTransactions.push({
        id: Date.now(),
        type,
        amount,
        category,
        frequency,
        startDate,
        endDate,
        note,
        active: true,
        lastRun: null
      });
    }

    saveData();
    processRecurringTransactions();
    renderRecurringTransactions();
    updateDashboard();
    updateReports();
    updateBudget();
    closeRecurringForm();
  }
);

function processRecurringTransactions() {
  const today = formatDate(new Date());
  let changed = false;

  recurringTransactions.forEach(item => {
    if (!item.active) return;

    let next = item.lastRun
      ? formatDate(addRecurringInterval(recurringDate(item.lastRun), item.frequency))
      : item.startDate;

    let guard = 0;

    while (next <= today && guard < 500) {
      if (item.endDate && next > item.endDate) {
        item.active = false;
        changed = true;
        break;
      }

      const exists = (item.type === "income" ? incomeData : expenseData).some(
        tx => tx.recurringId === item.id && tx.date === next
      );

      if (!exists) {
        const transaction = {
          amount: Number(item.amount),
          category: item.category,
          date: next,
          note: item.note || `Recurring ${item.category}`,
          recurringId: item.id
        };

        if (item.type === "income") incomeData.push(transaction);
        else expenseData.push(transaction);

        changed = true;
      }

      item.lastRun = next;
      next = formatDate(addRecurringInterval(recurringDate(next), item.frequency));
      guard++;
    }
  });

  if (changed) saveData();
}

function toggleRecurring(id) {
  const item = recurringTransactions.find(x => x.id === id);
  if (!item) return;

  item.active = !item.active;
  saveData();
  renderRecurringTransactions();
}

function deleteRecurring(id) {
  if (!confirm("Delete this recurring transaction?")) return;

  recurringTransactions = recurringTransactions.filter(x => x.id !== id);
  saveData();
  renderRecurringTransactions();
}

function renderRecurringTransactions() {
  const list = document.getElementById("recurringList");
  if (!list) return;

  if (recurringTransactions.length === 0) {
    list.innerHTML = '<p class="empty">No recurring transactions yet.</p>';
    return;
  }

  const labels = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly"
  };

  list.innerHTML = recurringTransactions.slice().reverse().map(item => {
    const nextDate = item.lastRun
      ? formatDate(addRecurringInterval(recurringDate(item.lastRun), item.frequency))
      : item.startDate;

    const endText = item.endDate ? ` · Ends ${item.endDate}` : "";

    return `
      <div class="recurring-card">
        <div class="recurring-header">
          <div>
            <strong>${item.type === "income" ? "🟢" : "🔴"} ${item.category}</strong>
            <small>${item.note || "Recurring transaction"}</small>
          </div>
          <span class="recurring-status ${item.active ? "active" : "paused"}">
            ${item.active ? "ACTIVE" : "PAUSED"}
          </span>
        </div>

        <div class="recurring-details">
          <strong>${item.type === "income" ? "+" : "-"} Rs. ${Number(item.amount).toLocaleString()}</strong>
          <span>${labels[item.frequency]} · Next ${nextDate}${endText}</span>
        </div>

        <div class="recurring-actions">
          <button onclick="toggleRecurring(${item.id})">
            ${item.active ? "⏸️ Pause" : "▶️ Resume"}
          </button>
          <button onclick="openRecurringForm(${item.id})">✏️ Edit</button>
          <button onclick="deleteRecurring(${item.id})">🗑️ Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

processRecurringTransactions();
renderRecurringTransactions();

function setupReportMonths() {

  const select = document.getElementById("reportMonth");

  if (!select) return;

  select.innerHTML = "";

  const now = new Date();

  for (let i = 0; i < 12; i++) {

    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const value =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0");

    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    select.innerHTML += `
      <option value="${value}">${label}</option>
    `;
  }

  updateReports();
}


function updateReports() {

  const select = document.getElementById("reportMonth");

  if (!select) return;

  const selectedMonth = select.value;

  const monthlyIncome = incomeData.filter(item =>
    item.date.startsWith(selectedMonth)
  );

  const monthlyExpense = expenseData.filter(item =>
    item.date.startsWith(selectedMonth)
  );

  const income = monthlyIncome.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const expense = monthlyExpense.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const saving = income - expense;

  document.getElementById("reportIncome").textContent =
    "Rs. " + income.toLocaleString();

  document.getElementById("reportExpense").textContent =
    "Rs. " + expense.toLocaleString();

  document.getElementById("reportSaving").textContent =
    "Rs. " + saving.toLocaleString();

  updateChart(income, expense);

  updateCategoryReport(monthlyExpense);
  updateFinancialInsights(
  monthlyIncome,
  monthlyExpense
);
  updateFinancialHealth2();
}

function updateFinancialInsights(
  monthlyIncome,
  monthlyExpense
) {

  const income =
    monthlyIncome.reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  const expense =
    monthlyExpense.reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );


  // -------------------------
  // TOP EXPENSE CATEGORY
  // -------------------------

  const categories = {};

  monthlyExpense.forEach(item => {

    const category =
      item.category || "Other";

    categories[category] =
      (categories[category] || 0) +
      Number(item.amount);

  });


  let topCategory = "No data";

  if (Object.keys(categories).length > 0) {

    topCategory =
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])[0][0];

  }


  // -------------------------
  // DAILY AVERAGE EXPENSE
  // -------------------------

  const daysInMonth =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

  const today =
    new Date().getDate();

  const daysPassed =
    Math.max(today, 1);

  const dailyAverage =
    expense / daysPassed;


  // -------------------------
  // INCOME DIFFERENCE
  // -------------------------

  const difference =
    income - expense;


  // -------------------------
  // HEALTH SCORE
  // -------------------------

  let score = 0;

  if (income > 0) {

    const savingRate =
      difference / income;

    score =
      Math.round(
        Math.max(
          0,
          Math.min(
            100,
            savingRate * 100
          )
        )
      );

  }


  // -------------------------
  // UPDATE UI
  // -------------------------

  document.getElementById(
    "topExpenseCategory"
  ).textContent =
    topCategory;


  document.getElementById(
    "dailyAverageExpense"
  ).textContent =
    "Rs. " +
    Math.round(
      dailyAverage
    ).toLocaleString();


  document.getElementById(
    "incomeDifference"
  ).textContent =
    "Rs. " +
    difference.toLocaleString();


  document.getElementById(
    "financialHealthScore"
  ).textContent =
    score + " / 100";


  // -------------------------
  // WARNING
  // -------------------------

  const warning =
    document.getElementById(
      "financialWarning"
    );


  if (income === 0 && expense === 0) {

    warning.textContent =
      "💡 Add some transactions to see your financial insights.";

  }

  else if (expense > income) {

    warning.textContent =
      "⚠️ Your expenses are higher than your income this month.";

  }

  else if (score >= 70) {

    warning.textContent =
      "✅ Good financial health! Keep controlling your expenses.";

  }

  else {

    warning.textContent =
      "💡 Try to increase your savings and reduce unnecessary expenses.";

  }

}


function updateChart(income, expense) {

  const max = Math.max(income, expense, 1);

  const incomeHeight =
    Math.max((income / max) * 150, 5);

  const expenseHeight =
    Math.max((expense / max) * 150, 5);

  document.getElementById("incomeBar").style.height =
    incomeHeight + "px";

  document.getElementById("expenseBar").style.height =
    expenseHeight + "px";
}


function updateCategoryReport(expenses) {

  const container =
    document.getElementById("categoryReport");

  const categories = {};

  expenses.forEach(item => {

    if (!categories[item.category]) {
      categories[item.category] = 0;
    }

    categories[item.category] += Number(item.amount);
  });

  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  if (Object.keys(categories).length === 0) {

    container.innerHTML =
      '<p class="empty">No expenses this month.</p>';

    return;
  }

  container.innerHTML =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => {

        const percentage =
          total > 0
            ? (amount / total) * 100
            : 0;

        return `
          <div class="category-item">

            <div class="category-row">
              <strong>${category}</strong>
              <span>
                Rs. ${amount.toLocaleString()}
              </span>
            </div>

            <div class="category-progress">
              <div style="width:${percentage}%"></div>
            </div>

          </div>
        `;

      })
      .join("");
}



let monthlyBudget =
  Number(localStorage.getItem("monthlyBudget")) || 0;

let categoryBudgets =
  JSON.parse(localStorage.getItem("categoryBudgets")) || {};

function saveBudgetData() {
  localStorage.setItem(
    "monthlyBudget",
    monthlyBudget
  );

  localStorage.setItem(
    "categoryBudgets",
    JSON.stringify(categoryBudgets)
  );
}


function setMonthlyBudget() {

  const amount = prompt(
    "Enter monthly budget:"
  );

  if (
    !amount ||
    isNaN(amount) ||
    Number(amount) <= 0
  ) {
    return;
  }

  monthlyBudget = Number(amount);

  saveBudgetData();
  updateBudget();
}


function saveCategoryBudget() {

  const category =
    document.getElementById("budgetCategory").value;

  const amount =
    Number(
      document.getElementById("categoryBudgetAmount").value
    );

  if (!category || !amount || amount <= 0) {
    alert("Please select category and enter amount.");
    return;
  }

  categoryBudgets[category] = amount;

  saveBudgetData();

  document.getElementById("categoryBudgetAmount").value = "";

  updateBudget();
}


function setupBudgetCategories() {

  const select =
    document.getElementById("budgetCategory");

  if (!select) return;

  select.innerHTML =
    '<option value="">Select Category</option>';

  expenseCategories.forEach(category => {

    select.innerHTML += `
      <option value="${category}">
        ${category}
      </option>
    `;

  });
}


function updateBudget() {

  const now = new Date();

  const currentMonth =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const monthlyExpenses =
    expenseData.filter(item =>
      item.date.startsWith(currentMonth)
    );

  const used =
    monthlyExpenses.reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  const remaining =
    monthlyBudget - used;

  document.getElementById(
    "monthlyBudget"
  ).textContent =
    "Rs. " + monthlyBudget.toLocaleString();

  document.getElementById(
    "budgetUsed"
  ).textContent =
    "Used: Rs. " + used.toLocaleString();

  document.getElementById(
    "budgetRemaining"
  ).textContent =
    "Remaining: Rs. " +
    Math.max(remaining, 0).toLocaleString();

  const percentage =
    monthlyBudget > 0
      ? Math.min(
          (used / monthlyBudget) * 100,
          100
        )
      : 0;

  document.getElementById(
    "budgetProgress"
  ).style.width =
    percentage + "%";

  updateCategoryBudgets(monthlyExpenses);
}


function updateCategoryBudgets(expenses) {

  const container =
    document.getElementById(
      "categoryBudgetList"
    );

  if (!container) return;

  const spent = {};

  expenses.forEach(item => {

    if (!spent[item.category]) {
      spent[item.category] = 0;
    }

    spent[item.category] +=
      Number(item.amount);
  });

  const budgetEntries =
    Object.entries(categoryBudgets);

  if (budgetEntries.length === 0) {

    container.innerHTML =
      '<p class="empty">No category budgets set.</p>';

    return;
  }

  container.innerHTML =
    budgetEntries.map(
      ([category, budget]) => {

        const used =
          spent[category] || 0;

        const percentage =
          budget > 0
            ? Math.min(
                (used / budget) * 100,
                100
              )
            : 0;

        const exceeded =
          used > budget;

        return `
          <div class="category-budget-item">

            <div class="category-budget-row">
              <strong>${category}</strong>

              <span>
                Rs. ${used.toLocaleString()}
                /
                Rs. ${budget.toLocaleString()}
              </span>
            </div>

            <div class="category-budget-progress">
              <div style="width:${percentage}%"></div>
            </div>

            ${
              exceeded
                ? `
                  <div class="budget-warning">
                    ⚠️ Budget exceeded!
                  </div>
                `
                : `
                  <small>
                    Remaining:
                    Rs. ${(budget - used).toLocaleString()}
                  </small>
                `
            }

          </div>
        `;

      }
    ).join("");
}


setupBudgetCategories();
updateBudget();

let savingsGoals =
  JSON.parse(localStorage.getItem("savingsGoals")) || [];


function saveSavingsGoals() {

  localStorage.setItem(
    "savingsGoals",
    JSON.stringify(savingsGoals)
  );
}


function openSavingsForm() {

  document
    .getElementById("savingsModal")
    .classList.add("show");

}


function closeSavingsForm() {

  document
    .getElementById("savingsModal")
    .classList.remove("show");

  document
    .getElementById("savingsForm")
    .reset();

}


document
  .getElementById("savingsForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
      document.getElementById("goalName").value.trim();

    const target =
      Number(
        document.getElementById("goalTarget").value
      );

    const saved =
      Number(
        document.getElementById("goalSaved").value
      ) || 0;

    const date =
      document.getElementById("goalDate").value;

    if (!name || target <= 0) {

      alert("Please enter a valid goal.");

      return;
    }

    if (saved > target) {

      alert(
        "Saved amount cannot be greater than target."
      );

      return;
    }

    savingsGoals.push({

      id: Date.now(),

      name: name,

      target: target,

      saved: saved,

      date: date

    });

    saveSavingsGoals();

    closeSavingsForm();

    renderSavingsGoals();

  });


function deleteSavingsGoal(id) {

  const confirmDelete =
    confirm("Delete this savings goal?");

  if (!confirmDelete) return;

  savingsGoals =
    savingsGoals.filter(
      goal => goal.id !== id
    );

  saveSavingsGoals();

  renderSavingsGoals();

}


function addMoneyToGoal(id) {

  const goal = savingsGoals.find(
    item => item.id === id
  );

  if (!goal) return;

  const remaining =
    Math.max(goal.target - goal.saved, 0);

  if (remaining <= 0) {
    alert("This goal is already completed.");
    return;
  }

  const amount = Number(
    prompt(
      `Enter amount to add:\nRemaining: Rs. ${remaining.toLocaleString()}`
    )
  );

  if (!amount || amount <= 0) {
    return;
  }

  if (amount > remaining) {
    alert(
      `Amount cannot be greater than remaining Rs. ${remaining.toLocaleString()}.`
    );
    return;
  }

  goal.saved += amount;

  saveSavingsGoals();
  renderSavingsGoals();
}


function editSavingsGoal(id) {

  const goal = savingsGoals.find(
    item => item.id === id
  );

  if (!goal) return;

  const name = prompt(
    "Goal name:",
    goal.name
  );

  if (name === null) return;

  const target = Number(
    prompt(
      "Target amount:",
      goal.target
    )
  );

  if (!target || target <= 0) {
    alert("Please enter a valid target amount.");
    return;
  }

  if (goal.saved > target) {
    alert(
      `Target cannot be lower than saved amount Rs. ${goal.saved.toLocaleString()}.`
    );
    return;
  }

  const date = prompt(
    "Target date (YYYY-MM-DD), optional:",
    goal.date || ""
  );

  if (date === null) return;

  goal.name = name.trim() || goal.name;
  goal.target = target;
  goal.date = date.trim();

  saveSavingsGoals();
  renderSavingsGoals();
}


function deleteSavingsGoal(id) {

  const confirmDelete =
    confirm("Delete this savings goal?");

  if (!confirmDelete) return;

  savingsGoals =
    savingsGoals.filter(
      goal => goal.id !== id
    );

  saveSavingsGoals();
  renderSavingsGoals();
}


function renderSavingsGoals() {

  const container =
    document.getElementById("savingsList");

  if (!container) return;

  if (savingsGoals.length === 0) {

    container.innerHTML =
      '<p class="empty">No savings goals yet.</p>';

    return;
  }

  container.innerHTML =
    savingsGoals.map(goal => {

      const percentage =
        goal.target > 0
          ? Math.min(
              (goal.saved / goal.target) * 100,
              100
            )
          : 0;

      const remaining =
        Math.max(
          goal.target - goal.saved,
          0
        );

      const completed =
        remaining === 0;

      return `

        <div class="savings-card">

          <div class="savings-card-header">

            <h3>🎯 ${goal.name}</h3>

            <div class="goal-actions">

              <button
                class="edit-goal"
                onclick="editSavingsGoal(${goal.id})"
                ${completed ? "" : ""}
              >
                ✏️
              </button>

              <button
                class="delete-goal"
                onclick="deleteSavingsGoal(${goal.id})"
              >
                🗑️
              </button>

            </div>

          </div>

          <div class="goal-amounts">

            <span>
              Saved:
              <strong>
                Rs. ${goal.saved.toLocaleString()}
              </strong>
            </span>

            <span>
              Target:
              <strong>
                Rs. ${goal.target.toLocaleString()}
              </strong>
            </span>

          </div>

          <div class="goal-progress">

            <div
              style="width:${percentage}%"
            ></div>

          </div>

          <div class="goal-percent">

            ${percentage.toFixed(1)}% completed

            ${
              completed
                ? " 🎉 Goal Completed!"
                : `
                  · Rs. ${remaining.toLocaleString()}
                  remaining
                `
            }

          </div>

          ${
            goal.date
              ? `
                <div class="goal-date">
                  📅 Target: ${goal.date}
                </div>
              `
              : ""
          }

          ${
            completed
              ? `
                <div class="goal-complete-badge">
                  ✅ Completed
                </div>
              `
              : `
                <button
                  class="add-money-goal"
                  onclick="addMoneyToGoal(${goal.id})"
                >
                  ➕ Add Money
                </button>
              `
          }

        </div>

      `;

    }).join("");

}


renderSavingsGoals();

let debts =
  JSON.parse(localStorage.getItem("debts")) || [];

let editingDebtId = null;


function saveDebts() {

  localStorage.setItem(
    "debts",
    JSON.stringify(debts)
  );

}


function openDebtForm(debtId = null) {

  editingDebtId = debtId;

  const modal = document.getElementById("debtModal");
  const form = document.getElementById("debtForm");
  if (!modal || !form) return;

  form.reset();

  const title = modal.querySelector("h2, h3, .modal-title");

  if (debtId !== null) {
    const debt = debts.find(item => item.id === debtId);
    if (!debt) { alert("Debt/Credit record not found."); return; }

    document.getElementById("debtType").value = debt.type || "";
    document.getElementById("debtPerson").value = debt.person || "";
    document.getElementById("debtAmount").value = debt.amount || "";
    document.getElementById("debtPaid").value = debt.paid || 0;
    document.getElementById("debtDate").value = debt.date || "";
    document.getElementById("debtNote").value = debt.note || "";
    if (title) title.textContent = "Edit Debt / Credit";
  } else {
    if (title) title.textContent = "Add Debt / Credit";
  }

  modal.classList.add("show");
}


function closeDebtForm() {

  document
    .getElementById("debtModal")
    .classList.remove("show");

  document
    .getElementById("debtForm")
    .reset();

  editingDebtId = null;

}


document
  .getElementById("debtForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const type =
      document.getElementById("debtType").value;

    const person =
      document.getElementById("debtPerson").value.trim();

    const amount =
      Number(
        document.getElementById("debtAmount").value
      );

    const paid =
      Number(
        document.getElementById("debtPaid").value
      ) || 0;

    const date =
      document.getElementById("debtDate").value;

    const note =
      document.getElementById("debtNote").value.trim();

    if (!type || !person || amount <= 0) {

      alert("Please complete required fields.");

      return;
    }

    if (paid > amount) {

      alert(
        "Paid amount cannot be greater than total amount."
      );

      return;
    }

    if (editingDebtId !== null) {

      const debt = debts.find(item => item.id === editingDebtId);
      if (!debt) { alert("Debt/Credit record not found."); return; }

      debt.type = type;
      debt.person = person;
      debt.amount = amount;
      debt.paid = paid;
      debt.date = date;
      debt.note = note;
      debt.status = paid >= amount ? "paid" : "pending";

    } else {

      debts.push({
        id: Date.now(),
        type: type,
        person: person,
        amount: amount,
        paid: paid,
        date: date,
        note: note,
        status: paid >= amount ? "paid" : "pending"
      });
    }

    saveDebts();

    closeDebtForm();

    renderDebts();

  });


function addDebtPayment(id) {

  const debt = debts.find(item => item.id === id);
  if (!debt) { alert("Debt/Credit record not found."); return; }

  const remaining = Math.max(Number(debt.amount) - Number(debt.paid), 0);
  if (remaining <= 0) { alert("This record is already fully paid."); return; }

  const input = prompt(
    `Current paid: Rs. ${Number(debt.paid).toLocaleString()}\nRemaining: Rs. ${remaining.toLocaleString()}\n\nEnter payment amount:`
  );
  if (input === null) return;

  const payment = Number(input);
  if (!Number.isFinite(payment) || payment <= 0) { alert("Please enter a valid payment amount."); return; }
  if (payment > remaining) { alert(`Payment cannot be greater than remaining Rs. ${remaining.toLocaleString()}.`); return; }

  debt.paid = Number(debt.paid) + payment;
  debt.status = debt.paid >= debt.amount ? "paid" : "pending";

  saveDebts();
  renderDebts();
  updateSmartAlerts();

  if (debt.status === "paid") alert("✅ Payment complete. Record marked as PAID.");
}


function markDebtPaid(id) {

  const debt =
    debts.find(item => item.id === id);

  if (!debt) return;

  debt.paid = debt.amount;

  debt.status = "paid";

  saveDebts();

  renderDebts();

}


function deleteDebt(id) {

  if (!confirm("Delete this record?")) {
    return;
  }

  debts =
    debts.filter(
      item => item.id !== id
    );

  saveDebts();

  renderDebts();

}


function renderDebts() {

  const list =
    document.getElementById("debtList");

  if (!list) return;

  let receive = 0;
  let pay = 0;

  debts.forEach(debt => {

    const remaining =
      Math.max(
        debt.amount - debt.paid,
        0
      );

    if (debt.type === "receive") {
      receive += remaining;
    } else {
      pay += remaining;
    }

  });

  document.getElementById(
    "totalReceive"
  ).textContent =
    "Rs. " + receive.toLocaleString();

  document.getElementById(
    "totalPay"
  ).textContent =
    "Rs. " + pay.toLocaleString();


  if (debts.length === 0) {

    list.innerHTML =
      '<p class="empty">No debt or credit records.</p>';

    return;
  }


  list.innerHTML =
    debts
      .slice()
      .reverse()
      .map(debt => {

        const remaining =
          Math.max(
            debt.amount - debt.paid,
            0
          );

        const isPaid =
          debt.status === "paid";

        return `

          <div class="debt-card">

            <div class="debt-card-header">

              <div>

                <h3>
                  ${
                    debt.type === "receive"
                      ? "💰 "
                      : "💸 "
                  }

                  ${debt.person}
                </h3>

                <small>
                  ${
                    debt.type === "receive"
                      ? "Receive"
                      : "Pay"
                  }
                </small>

              </div>

              <span
                class="debt-status ${
                  isPaid
                    ? "status-paid"
                    : "status-pending"
                }"
              >
                ${
                  isPaid
                    ? "PAID"
                    : "PENDING"
                }
              </span>

            </div>


            <div class="debt-info">

              <div>
                Total<br>
                <strong>
                  Rs. ${debt.amount.toLocaleString()}
                </strong>
              </div>

              <div>
                Paid<br>
                <strong>
                  Rs. ${debt.paid.toLocaleString()}
                </strong>
              </div>

              <div>
                Remaining<br>
                <strong>
                  Rs. ${remaining.toLocaleString()}
                </strong>
              </div>

              <div>
                Due Date<br>
                <strong>
                  ${debt.date || "Not set"}
                </strong>
              </div>

            </div>


            ${
              debt.note
                ? `
                  <small>
                    📝 ${debt.note}
                  </small>
                `
                : ""
            }


            <div class="debt-actions">

              ${
                !isPaid
                  ? `
                    <button
                      class="payment-debt"
                      onclick="addDebtPayment(${debt.id})"
                    >
                      💵 Add Payment
                    </button>

                    <button
                      class="paid-btn"
                      onclick="markDebtPaid(${debt.id})"
                    >
                      ✓ Mark Paid
                    </button>
                  `
                  : ""
              }

              <button
                class="edit-debt"
                onclick="openDebtForm(${debt.id})"
              >
                ✏️ Edit
              </button>

              <button
                class="delete-debt"
                onclick="deleteDebt(${debt.id})"
              >
                🗑️ Delete
              </button>

            </div>

          </div>

        `;

      })
      .join("");

}


renderDebts();




/* =========================
   FINANCIAL HEALTH 2.0
   ========================= */

function calculateFinancialHealth2() {
  const now = new Date();
  const monthKey =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const income = incomeData
    .filter(item => item.date && item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = expenseData
    .filter(item => item.date && item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const saved = income - expense;
  const savingRate = income > 0 ? (saved / income) * 100 : 0;

  let savingPoints = 0;
  if (savingRate >= 30) savingPoints = 30;
  else if (savingRate >= 25) savingPoints = 27;
  else if (savingRate >= 20) savingPoints = 24;
  else if (savingRate >= 15) savingPoints = 20;
  else if (savingRate >= 10) savingPoints = 15;
  else if (savingRate > 0) savingPoints = 8;

  let expensePoints = 0;
  if (income > 0) {
    const expenseRate = (expense / income) * 100;
    if (expenseRate <= 50) expensePoints = 25;
    else if (expenseRate <= 60) expensePoints = 22;
    else if (expenseRate <= 70) expensePoints = 18;
    else if (expenseRate <= 80) expensePoints = 13;
    else if (expenseRate <= 100) expensePoints = 7;
  }

  let goalPoints = 0;
  const validGoals = Array.isArray(savingsGoals)
    ? savingsGoals.filter(g => Number(g.target || 0) > 0)
    : [];

  if (validGoals.length) {
    const completion = validGoals.reduce((sum, goal) => {
      const pct =
        Number(goal.saved || 0) / Number(goal.target || 0) * 100;
      return sum + Math.min(100, Math.max(0, pct));
    }, 0) / validGoals.length;

    if (completion >= 80) goalPoints = 20;
    else if (completion >= 60) goalPoints = 16;
    else if (completion >= 40) goalPoints = 12;
    else if (completion >= 20) goalPoints = 7;
    else goalPoints = 3;
  }

  const outstandingDebt = Array.isArray(debts)
    ? debts.reduce(
        (sum, item) =>
          sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0),
        0
      )
    : 0;

  let debtPoints = 0;
  if (outstandingDebt === 0) debtPoints = 15;
  else if (income > 0) {
    const debtRatio = outstandingDebt / income;
    if (debtRatio <= 0.25) debtPoints = 13;
    else if (debtRatio <= 0.50) debtPoints = 10;
    else if (debtRatio <= 1) debtPoints = 6;
    else debtPoints = 2;
  }

  const accountBalance = Array.isArray(accounts)
    ? accounts.reduce((sum, item) => sum + Number(item.balance || 0), 0)
    : 0;

  let balancePoints = 0;
  if (expense === 0 && accountBalance > 0) balancePoints = 10;
  else if (expense > 0) {
    const coverage = accountBalance / expense;
    if (coverage >= 3) balancePoints = 10;
    else if (coverage >= 2) balancePoints = 8;
    else if (coverage >= 1) balancePoints = 6;
    else if (coverage >= 0.5) balancePoints = 3;
  }

  const score =
    savingPoints + expensePoints + goalPoints + debtPoints + balancePoints;

  let status = "Needs Attention";
  if (score >= 80) status = "Excellent";
  else if (score >= 65) status = "Good";
  else if (score >= 45) status = "Fair";

  const opportunities = [
    [savingPoints, 30, "increase your savings rate"],
    [expensePoints, 25, "control monthly expenses"],
    [goalPoints, 20, "build your savings goals"],
    [debtPoints, 15, "reduce outstanding debt"],
    [balancePoints, 10, "build a stronger cash balance"]
  ].sort((a, b) => (a[0] / a[1]) - (b[0] / b[1]));

  let advice;
  if (income === 0 && expense === 0) {
    advice = "💡 Add this month's income and expenses to get a meaningful score.";
  } else if (score >= 80) {
    advice = "✅ Excellent financial health. Keep your current habits consistent.";
  } else {
    advice = `🧠 Biggest improvement opportunity: ${opportunities[0][2]}.`;
  }

  return {
    score, status, savingPoints, expensePoints,
    goalPoints, debtPoints, balancePoints, advice
  };
}

function updateFinancialHealth2() {
  const result = calculateFinancialHealth2();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("healthScore2Value", `${result.score} / 100`);
  setText("healthScore2Status", result.status);
  setText("healthScore2Ring", `${result.score}%`);
  setText("healthSavingPoints", `${result.savingPoints}/30`);
  setText("healthExpensePoints", `${result.expensePoints}/25`);
  setText("healthGoalPoints", `${result.goalPoints}/20`);
  setText("healthDebtPoints", `${result.debtPoints}/15`);
  setText("healthBalancePoints", `${result.balancePoints}/10`);
  setText("healthScore2Advice", result.advice);

  const ring = document.getElementById("healthScore2Ring");
  if (ring) ring.style.setProperty("--health-deg", `${result.score * 3.6}deg`);

  return result;
}

/* =========================
   SMART ALERTS
   ========================= */

function updateSmartAlerts() {
  const container = document.getElementById("smartAlertsList");
  if (!container) return;

  const alerts = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Monthly budget alert
  if (typeof monthlyBudget !== "undefined" && monthlyBudget > 0) {
    const monthKey =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0");

    const used = expenseData
      .filter(item => item.date && item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const percent = (used / monthlyBudget) * 100;

    if (percent >= 100) {
      alerts.push({
        icon: "🔴",
        title: "Monthly Budget Exceeded",
        text: `Used Rs. ${used.toLocaleString()} of Rs. ${Number(monthlyBudget).toLocaleString()}.`,
        level: "danger"
      });
    } else if (percent >= 80) {
      alerts.push({
        icon: "⚠️",
        title: "Monthly Budget Warning",
        text: `${percent.toFixed(0)}% of your monthly budget has been used.`,
        level: "warning"
      });
    }
  }

  // Savings rate alert
  const income = incomeData
    .filter(item => item.date && item.date.startsWith(
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0")
    ))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = expenseData
    .filter(item => item.date && item.date.startsWith(
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0")
    ))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (income > 0 && expense > income) {
    alerts.push({
      icon: "📉",
      title: "Expenses Are Higher Than Income",
      text: `This month you are spending Rs. ${(expense - income).toLocaleString()} more than your income.`,
      level: "danger"
    });
  }

  // Debt due soon / overdue
  if (Array.isArray(debts)) {
    debts.forEach(debt => {
      if (!debt.date || debt.status === "paid") return;

      const due = new Date(debt.date + "T00:00:00");
      const days = Math.ceil((due - today) / 86400000);
      const remaining = Math.max(
        Number(debt.amount || 0) - Number(debt.paid || 0),
        0
      );

      if (remaining <= 0) return;

      if (days < 0) {
        alerts.push({
          icon: "🔴",
          title: `${debt.person || "Debt"} is overdue`,
          text: `Rs. ${remaining.toLocaleString()} remaining.`,
          level: "danger"
        });
      } else if (days <= 3) {
        alerts.push({
          icon: "💳",
          title: `${debt.person || "Debt"} due soon`,
          text: `Rs. ${remaining.toLocaleString()} remaining — due in ${days} day${days === 1 ? "" : "s"}.`,
          level: "warning"
        });
      }
    });
  }

  // Savings goal deadline
  if (Array.isArray(savingsGoals)) {
    savingsGoals.forEach(goal => {
      const remaining = Math.max(
        Number(goal.target || 0) - Number(goal.saved || 0),
        0
      );

      if (!goal.date || remaining <= 0) return;

      const target = new Date(goal.date + "T00:00:00");
      const days = Math.ceil((target - today) / 86400000);

      if (days < 0) {
        alerts.push({
          icon: "🎯",
          title: `${goal.name || "Savings goal"} deadline passed`,
          text: `Rs. ${remaining.toLocaleString()} still needed.`,
          level: "warning"
        });
      } else if (days <= 7) {
        alerts.push({
          icon: "🎯",
          title: `${goal.name || "Savings goal"} deadline is near`,
          text: `Rs. ${remaining.toLocaleString()} still needed in ${days} day${days === 1 ? "" : "s"}.`,
          level: "warning"
        });
      }
    });
  }


  if (typeof getBillAlerts === "function") {
    getBillAlerts().forEach(alert => alerts.push(alert));
  }

  if (!alerts.length) {
    container.innerHTML =
      '<p class="empty">✅ No important alerts right now.</p>';
    return;
  }

  container.innerHTML = alerts.slice(0, 8).map(alert => `
    <div class="smart-alert ${alert.level}">
      <span class="smart-alert-icon">${alert.icon}</span>
      <div>
        <strong>${alert.title}</strong>
        <small>${alert.text}</small>
      </div>
    </div>
  `).join("");
}





/* =========================
   PROFESSIONAL UI / THEMES
   ========================= */

function applyFinanceTheme() {
  const theme = localStorage.getItem("financeTheme") || "system";
  const root = document.documentElement;

  root.classList.remove("finance-dark");

  if (theme === "dark") {
    root.classList.add("finance-dark");
  } else if (theme === "system") {
    if (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("finance-dark");
    }
  }

  const accent =
    localStorage.getItem("financeAccent") || "#2563eb";

  root.style.setProperty("--finance-accent", accent);
  root.style.setProperty("--finance-accent-soft", accent + "22");
}

function setFinanceTheme(theme) {
  localStorage.setItem("financeTheme", theme);
  applyFinanceTheme();
}

function setFinanceAccent(color) {
  localStorage.setItem("financeAccent", color);
  applyFinanceTheme();
}

function updateProfessionalKpi() {
  const balanceEl = document.getElementById("kpiBalance");
  const rateEl = document.getElementById("kpiSavingRate");
  const goalsEl = document.getElementById("kpiGoals");

  if (!balanceEl && !rateEl && !goalsEl) return;

  const income = (typeof incomeData !== "undefined" ? incomeData : [])
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = (typeof expenseData !== "undefined" ? expenseData : [])
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const accountBalance = (typeof accounts !== "undefined" ? accounts : [])
    .reduce((sum, item) => sum + Number(item.balance || 0), 0);

  const balance = accountBalance || (income - expense);
  const rate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const goals = typeof savingsGoals !== "undefined"
    ? savingsGoals.filter(g => Number(g.saved || 0) < Number(g.target || 0)).length
    : 0;

  if (balanceEl) {
    balanceEl.textContent = "Rs. " + balance.toLocaleString();
  }

  if (rateEl) {
    rateEl.textContent = Math.max(0, rate).toFixed(0) + "%";
  }

  if (goalsEl) {
    goalsEl.textContent = String(goals);
  }
}

applyFinanceTheme();

/* =========================
   EXPORT & PRINT REPORTS
   ========================= */

function getFinanceExportData() {
  const now = new Date();
  const monthKey =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const income = (typeof incomeData !== "undefined" ? incomeData : [])
    .filter(item => item.date && item.date.startsWith(monthKey));

  const expenses = (typeof expenseData !== "undefined" ? expenseData : [])
    .filter(item => item.date && item.date.startsWith(monthKey));

  const incomeTotal = income.reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  );

  const expenseTotal = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0), 0
  );

  return {
    month: now.toLocaleString("en", { month: "long", year: "numeric" }),
    income,
    expenses,
    incomeTotal,
    expenseTotal,
    savings: incomeTotal - expenseTotal,
    accounts: typeof accounts !== "undefined" ? accounts : [],
    goals: typeof savingsGoals !== "undefined" ? savingsGoals : [],
    debts: typeof debts !== "undefined" ? debts : []
  };
}

function exportTransactionsCSV() {
  const income = typeof incomeData !== "undefined" ? incomeData : [];
  const expenses = typeof expenseData !== "undefined" ? expenseData : [];

  const rows = [
    ["Date", "Type", "Amount", "Category", "Note"]
  ];

  income.forEach(item => {
    rows.push([
      item.date || "",
      "Income",
      Number(item.amount || 0),
      item.category || "",
      item.note || ""
    ]);
  });

  expenses.forEach(item => {
    rows.push([
      item.date || "",
      "Expense",
      Number(item.amount || 0),
      item.category || "",
      item.note || ""
    ]);
  });

  const csv = rows.map(row =>
    row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")
  ).join("\n");

  downloadTextFile(
    csv,
    `PersonalFinanceManager_Transactions_${new Date().toISOString().slice(0,10)}.csv`,
    "text/csv;charset=utf-8"
  );
}

function exportFinancialReport() {
  const data = getFinanceExportData();

  const accountLines = data.accounts.length
    ? data.accounts.map(a =>
        `<tr><td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.type)}</td><td>Rs. ${Number(a.balance || 0).toLocaleString()}</td></tr>`
      ).join("")
    : `<tr><td colspan="3">No accounts</td></tr>`;

  const goalLines = data.goals.length
    ? data.goals.map(g =>
        `<tr><td>${escapeHtml(g.name)}</td><td>Rs. ${Number(g.saved || 0).toLocaleString()}</td><td>Rs. ${Number(g.target || 0).toLocaleString()}</td></tr>`
      ).join("")
    : `<tr><td colspan="3">No savings goals</td></tr>`;

  const debtLines = data.debts.length
    ? data.debts.map(d => {
        const remaining = Math.max(
          Number(d.amount || 0) - Number(d.paid || 0), 0
        );
        return `<tr><td>${escapeHtml(d.person || "")}</td><td>Rs. ${Number(d.amount || 0).toLocaleString()}</td><td>Rs. ${remaining.toLocaleString()}</td></tr>`;
      }).join("")
    : `<tr><td colspan="3">No debt/credit records</td></tr>`;

  const htmlReport = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Personal Finance Report</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#222;max-width:850px;margin:auto}
h1{margin-bottom:4px} h2{margin-top:26px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.box{padding:14px;border:1px solid #ddd;border-radius:10px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5}
@media(max-width:600px){.summary{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Personal Finance Report</h1>
<p>${escapeHtml(data.month)}</p>
<div class="summary">
<div class="box"><small>Income</small><h2>Rs. ${data.incomeTotal.toLocaleString()}</h2></div>
<div class="box"><small>Expense</small><h2>Rs. ${data.expenseTotal.toLocaleString()}</h2></div>
<div class="box"><small>Savings</small><h2>Rs. ${data.savings.toLocaleString()}</h2></div>
</div>
<h2>Accounts</h2>
<table><tr><th>Name</th><th>Type</th><th>Balance</th></tr>${accountLines}</table>
<h2>Savings Goals</h2>
<table><tr><th>Goal</th><th>Saved</th><th>Target</th></tr>${goalLines}</table>
<h2>Debt / Credit</h2>
<table><tr><th>Person</th><th>Total</th><th>Remaining</th></tr>${debtLines}</table>
</body>
</html>`;

  downloadTextFile(
    htmlReport,
    `PersonalFinanceManager_Report_${new Date().toISOString().slice(0,10)}.html`,
    "text/html;charset=utf-8"
  );

  alert("✅ Financial report exported.");
}

function printFinancialReport() {
  const data = getFinanceExportData();

  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Please allow pop-ups to print the report.");
    return;
  }

  popup.document.write(`
    <html>
    <head>
      <title>Personal Finance Report</title>
      <style>
        body{font-family:Arial;padding:25px;color:#222}
        .summary{display:flex;gap:15px;margin:20px 0}
        .box{padding:15px;border:1px solid #ddd;border-radius:10px;flex:1}
        table{width:100%;border-collapse:collapse;margin-top:15px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        th{background:#f5f5f5}
      </style>
    </head>
    <body>
      <h1>Personal Finance Report</h1>
      <p>${escapeHtml(data.month)}</p>
      <div class="summary">
        <div class="box">Income<br><strong>Rs. ${data.incomeTotal.toLocaleString()}</strong></div>
        <div class="box">Expense<br><strong>Rs. ${data.expenseTotal.toLocaleString()}</strong></div>
        <div class="box">Savings<br><strong>Rs. ${data.savings.toLocaleString()}</strong></div>
      </div>
      <h2>Accounts</h2>
      <table>
        <tr><th>Account</th><th>Balance</th></tr>
        ${data.accounts.map(a => `<tr><td>${escapeHtml(a.name)}</td><td>Rs. ${Number(a.balance || 0).toLocaleString()}</td></tr>`).join("") || "<tr><td colspan='2'>No accounts</td></tr>"}
      </table>
      <h2>Savings Goals</h2>
      <table>
        <tr><th>Goal</th><th>Saved</th><th>Target</th></tr>
        ${data.goals.map(g => `<tr><td>${escapeHtml(g.name)}</td><td>Rs. ${Number(g.saved || 0).toLocaleString()}</td><td>Rs. ${Number(g.target || 0).toLocaleString()}</td></tr>`).join("") || "<tr><td colspan='3'>No goals</td></tr>"}
      </table>
    </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================
   BACKUP & RESTORE
   ========================= */

function collectFinanceBackup() {
  const data = {};

  const keys = [
    "incomeData",
    "expenseData",
    "transactions",
    "savingsGoals",
    "debts",
    "accounts",
    "recurringTransactions",
    "budgets",
    "categoryBudgets",
    "monthlyBudget"
  ];

  keys.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  });

  data.appName = "Personal Finance Manager";
  data.backupVersion = 1;
  data.createdAt = new Date().toISOString();

  return data;
}

function exportFinanceBackup() {
  try {
    const data = collectFinanceBackup();
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `PersonalFinanceManager_Backup_${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const now = new Date().toLocaleString();
    localStorage.setItem("lastFinanceBackup", now);
    updateLastBackupText();

    alert("✅ Backup exported successfully.");
  } catch (error) {
    console.error(error);
    alert("Could not create the backup.");
  }
}

function importFinanceBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function() {
    try {
      const data = JSON.parse(reader.result);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid backup");
      }

      const allowed = [
        "incomeData",
        "expenseData",
        "transactions",
        "savingsGoals",
        "debts",
        "accounts",
        "recurringTransactions",
        "budgets",
        "categoryBudgets",
        "monthlyBudget"
      ];

      let restored = 0;

      allowed.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(
            key,
            typeof data[key] === "string"
              ? data[key]
              : JSON.stringify(data[key])
          );
          restored++;
        }
      });

      if (!restored) {
        throw new Error("No supported finance data found");
      }

      alert(
        `✅ Backup restored successfully.\n${restored} data sections imported.\n\nThe app will reload now.`
      );

      location.reload();
    } catch (error) {
      console.error(error);
      alert("❌ Invalid or unsupported backup file.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function updateLastBackupText() {
  const el = document.getElementById("lastBackupText");
  if (!el) return;

  const value = localStorage.getItem("lastFinanceBackup");
  el.textContent = value
    ? `Last backup: ${value}`
    : "No backup recorded.";
}

updateLastBackupText();

/* =========================
   SMART FINANCE ASSISTANT
   ========================= */

function financeDataSummary() {
  const now = new Date();
  const monthKey =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  const income = (typeof incomeData !== "undefined" ? incomeData : [])
    .filter(item => item.date && item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = (typeof expenseData !== "undefined" ? expenseData : [])
    .filter(item => item.date && item.date.startsWith(monthKey))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const saved = income - expense;

  const categories = {};
  (typeof expenseData !== "undefined" ? expenseData : [])
    .filter(item => item.date && item.date.startsWith(monthKey))
    .forEach(item => {
      const category = item.category || "Other";
      categories[category] =
        (categories[category] || 0) + Number(item.amount || 0);
    });

  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0] || null;

  const accountTotal = (typeof accounts !== "undefined" ? accounts : [])
    .reduce((sum, item) => sum + Number(item.balance || 0), 0);

  return {
    income,
    expense,
    saved,
    savingRate: income > 0 ? (saved / income) * 100 : 0,
    topCategory,
    accountTotal,
    goals: typeof savingsGoals !== "undefined" ? savingsGoals : [],
    debts: typeof debts !== "undefined" ? debts : []
  };
}

function getFinanceAssistantAnswer(question) {
  const q = question.toLowerCase().trim();
  const d = financeDataSummary();

  if (!q) return "Please ask me a finance question.";

  if (
    q.includes("spend") ||
    q.includes("expense") ||
    q.includes("kharcha")
  ) {
    if (q.includes("biggest") || q.includes("highest") || q.includes("sabse")) {
      if (!d.topCategory) {
        return "I don't have enough expense data for this month yet.";
      }
      return `🔥 Your biggest expense category this month is ${d.topCategory[0]} with Rs. ${d.topCategory[1].toLocaleString()}.`;
    }
    return `💸 This month your expenses are Rs. ${d.expense.toLocaleString()}.`;
  }

  if (
    q.includes("income") ||
    q.includes("earning") ||
    q.includes("salary")
  ) {
    return `💰 This month your income is Rs. ${d.income.toLocaleString()}.`;
  }

  if (
    q.includes("save") ||
    q.includes("saving") ||
    q.includes("bachat")
  ) {
    if (d.income <= 0) {
      return "Add some income data first, then I can calculate your saving rate.";
    }
    return `💰 You saved Rs. ${Math.max(d.saved, 0).toLocaleString()} this month. Your saving rate is ${Math.max(d.savingRate, 0).toFixed(1)}%.`;
  }

  if (
    q.includes("balance") ||
    q.includes("wallet") ||
    q.includes("account")
  ) {
    return `🏦 Your Accounts/Wallets total is Rs. ${d.accountTotal.toLocaleString()}.`;
  }

  if (
    q.includes("health") ||
    q.includes("financial health") ||
    q.includes("score")
  ) {
    let score = 0;
    if (d.income > 0) {
      score = Math.max(0, Math.min(100, Math.round(d.savingRate)));
    }

    if (score >= 70) {
      return `❤️ Financial Health: ${score}/100 — Great saving performance. Keep it up!`;
    }
    if (score >= 40) {
      return `❤️ Financial Health: ${score}/100 — Fair. Try to increase your savings and control large expenses.`;
    }
    return `❤️ Financial Health: ${score}/100 — Needs attention. Focus on reducing unnecessary expenses and building savings.`;
  }

  if (q.includes("goal") || q.includes("target")) {
    if (!d.goals.length) {
      return "🎯 You don't have any savings goals yet.";
    }

    const pending = d.goals.filter(
      goal => Number(goal.saved || 0) < Number(goal.target || 0)
    );

    if (!pending.length) {
      return "🎉 All your savings goals are completed!";
    }

    const goal = pending[0];
    const remaining =
      Math.max(Number(goal.target || 0) - Number(goal.saved || 0), 0);

    return `🎯 Your next goal is ${goal.name}. You need Rs. ${remaining.toLocaleString()} more to reach it.`;
  }

  if (q.includes("debt") || q.includes("credit") || q.includes("loan")) {
    const remaining = d.debts.reduce(
      (sum, item) =>
        sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0),
      0
    );

    return `💳 Your outstanding Debt/Credit amount is Rs. ${remaining.toLocaleString()}.`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("salam")) {
    return "👋 Hello! I can help you understand your income, expenses, savings, accounts, goals and debt.";
  }

  return "🤖 I can answer questions about your monthly income, expenses, savings, biggest expense, accounts, goals, debt and financial health.";
}

function addAssistantMessage(text, type = "assistant") {
  const chat = document.getElementById("assistantChat");
  if (!chat) return;

  const div = document.createElement("div");
  div.className =
    type === "user" ? "assistant-message user-message" : "assistant-message";

  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function askFinanceAssistant(question) {
  const input = document.getElementById("assistantInput");
  if (input) input.value = question;

  addAssistantMessage(question, "user");

  const answer = getFinanceAssistantAnswer(question);

  setTimeout(() => {
    addAssistantMessage(answer);
  }, 120);
}

document.getElementById("assistantForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("assistantInput");
  const question = input.value.trim();

  if (!question) return;

  input.value = "";
  askFinanceAssistant(question);
});



/* =========================
   BILLS & DUE-DATE REMINDERS
   ========================= */

let bills =
  JSON.parse(localStorage.getItem("bills")) || [];

let editingBillId = null;

function saveBills() {
  localStorage.setItem("bills", JSON.stringify(bills));
}

function billDueStatus(dateString) {
  if (!dateString) return { label: "NO DATE", level: "normal", days: null };

  const today = new Date();
  const todayStart =
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const due = new Date(dateString + "T00:00:00");
  const days = Math.ceil((due - todayStart) / 86400000);

  if (days < 0) {
    return { label: "OVERDUE", level: "danger", days };
  }

  if (days === 0) {
    return { label: "DUE TODAY", level: "danger", days };
  }

  if (days <= 3) {
    return { label: `DUE IN ${days} DAY${days === 1 ? "" : "S"}`, level: "warning", days };
  }

  return { label: "UPCOMING", level: "normal", days };
}

function openBillForm(id = null) {
  editingBillId = id;

  const modal = document.getElementById("billModal");
  const form = document.getElementById("billForm");
  if (!modal || !form) return;

  form.reset();

  document.getElementById("billModalTitle").textContent =
    id === null ? "Add Bill" : "Edit Bill";

  if (id !== null) {
    const bill = bills.find(item => item.id === id);
    if (!bill) return;

    document.getElementById("billName").value = bill.name || "";
    document.getElementById("billAmount").value = bill.amount || "";
    document.getElementById("billDate").value = bill.date || "";
    document.getElementById("billRepeat").value = bill.repeat || "none";
    document.getElementById("billNote").value = bill.note || "";
  } else {
    document.getElementById("billDate").value =
      new Date().toISOString().slice(0, 10);
  }

  modal.classList.add("show");
}

function closeBillForm() {
  document.getElementById("billModal")?.classList.remove("show");
  document.getElementById("billForm")?.reset();
  editingBillId = null;
}

document.getElementById("billForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("billName").value.trim();
  const amount = Number(document.getElementById("billAmount").value);
  const date = document.getElementById("billDate").value;
  const repeat = document.getElementById("billRepeat").value;
  const note = document.getElementById("billNote").value.trim();

  if (!name || !date || !Number.isFinite(amount) || amount <= 0) {
    alert("Please enter valid bill details.");
    return;
  }

  if (editingBillId !== null) {
    const bill = bills.find(item => item.id === editingBillId);
    if (!bill) return;

    bill.name = name;
    bill.amount = amount;
    bill.date = date;
    bill.repeat = repeat;
    bill.note = note;
  } else {
    bills.push({
      id: Date.now(),
      name,
      amount,
      date,
      repeat,
      note,
      active: true
    });
  }

  saveBills();
  renderBills();
  closeBillForm();
});

function deleteBill(id) {
  if (!confirm("Delete this bill?")) return;

  bills = bills.filter(item => item.id !== id);
  saveBills();
  renderBills();
}

function toggleBill(id) {
  const bill = bills.find(item => item.id === id);
  if (!bill) return;

  bill.active = bill.active === false;
  saveBills();
  renderBills();
}

function advanceRecurringBill(bill) {
  if (!bill || bill.repeat === "none") return;

  const date = new Date(bill.date + "T00:00:00");

  if (bill.repeat === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (bill.repeat === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else if (bill.repeat === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  }

  bill.date = date.toISOString().slice(0, 10);
}

function renderBills() {
  const list = document.getElementById("billsList");
  if (!list) return;

  let upcoming = 0;
  let dueSoon = 0;
  let overdue = 0;

  const activeBills = bills.filter(item => item.active !== false);

  activeBills.forEach(bill => {
    const status = billDueStatus(bill.date);

    if (status.days !== null && status.days < 0) overdue++;
    else if (status.days !== null && status.days <= 3) dueSoon++;
    else upcoming++;
  });

  const upcomingEl = document.getElementById("upcomingBillsCount");
  const dueSoonEl = document.getElementById("dueSoonBillsCount");
  const overdueEl = document.getElementById("overdueBillsCount");

  if (upcomingEl) upcomingEl.textContent = upcoming;
  if (dueSoonEl) dueSoonEl.textContent = dueSoon;
  if (overdueEl) overdueEl.textContent = overdue;

  if (!bills.length) {
    list.innerHTML =
      '<p class="empty">No bills added yet.</p>';
    return;
  }

  list.innerHTML = bills
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map(bill => {
      const status = billDueStatus(bill.date);
      const active = bill.active !== false;

      return `
        <div class="bill-card ${active ? "" : "bill-paused"}">
          <div class="bill-card-top">
            <div>
              <strong>🔔 ${escapeHtml(bill.name)}</strong>
              <small>${bill.repeat === "none" ? "One time" : "Repeats " + bill.repeat}</small>
            </div>

            <strong>Rs. ${Number(bill.amount || 0).toLocaleString()}</strong>
          </div>

          <div class="bill-meta">
            <span>📅 ${escapeHtml(bill.date)}</span>
            <span class="bill-status ${status.level}">
              ${status.label}
            </span>
          </div>

          ${bill.note ? `<small class="bill-note">📝 ${escapeHtml(bill.note)}</small>` : ""}

          <div class="bill-actions">
            <button class="edit-bill" onclick="openBillForm(${bill.id})">✏️ Edit</button>
            <button class="pause-bill" onclick="toggleBill(${bill.id})">
              ${active ? "⏸️ Pause" : "▶️ Resume"}
            </button>
            <button class="delete-bill" onclick="deleteBill(${bill.id})">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join("");
}

function getBillAlerts() {
  return bills
    .filter(bill => bill.active !== false)
    .map(bill => {
      const status = billDueStatus(bill.date);
      if (status.days !== null && status.days <= 3) {
        return {
          icon: status.days < 0 ? "🔴" : "🔔",
          title: `${bill.name} ${status.days < 0 ? "is overdue" : "is due soon"}`,
          text: `Rs. ${Number(bill.amount || 0).toLocaleString()} — ${status.label}`,
          level: status.days < 0 ? "danger" : "warning"
        };
      }
      return null;
    })
    .filter(Boolean);
}

renderBills();

/* =========================
   TRANSFER HISTORY
   ========================= */

let transferHistory =
  JSON.parse(localStorage.getItem("transferHistory")) || [];

function saveTransferHistory() {
  localStorage.setItem(
    "transferHistory",
    JSON.stringify(transferHistory)
  );
}

function renderTransferHistory() {
  const list = document.getElementById("transferHistoryList");
  if (!list) return;

  if (!transferHistory.length) {
    list.innerHTML =
      '<p class="empty">No transfers yet.</p>';
    return;
  }

  list.innerHTML = transferHistory
    .slice()
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .map(transfer => `
      <div class="transfer-history-card">
        <div class="transfer-history-top">
          <div>
            <strong>
              ${accountIcon("other")}
              ${escapeHtml(transfer.fromName)}
              →
              ${escapeHtml(transfer.toName)}
            </strong>
            <small>${escapeHtml(transfer.date || "")}</small>
          </div>
          <strong>
            Rs. ${Number(transfer.amount || 0).toLocaleString()}
          </strong>
        </div>

        ${
          transfer.note
            ? `<small class="transfer-note">📝 ${escapeHtml(transfer.note)}</small>`
            : ""
        }

        <button
          class="delete-transfer"
          onclick="deleteTransferHistory(${transfer.id})"
        >
          🗑️ Delete History
        </button>
      </div>
    `).join("");
}

function deleteTransferHistory(id) {
  if (!confirm("Delete this transfer history record?")) return;

  transferHistory = transferHistory.filter(
    item => item.id !== id
  );

  saveTransferHistory();
  renderTransferHistory();
}

/* =========================
   ACCOUNTS / WALLETS
   ========================= */

let accounts =
  JSON.parse(localStorage.getItem("accounts")) || [];

let editingAccountId = null;

function saveAccounts() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

function accountIcon(type) {
  const icons = {
    cash: "💵",
    bank: "🏦",
    easypaisa: "📱",
    jazzcash: "📱",
    card: "💳",
    other: "📦"
  };
  return icons[type] || "🏦";
}

function accountTypeName(type) {
  const names = {
    cash: "Cash",
    bank: "Bank",
    easypaisa: "Easypaisa",
    jazzcash: "JazzCash",
    card: "Card",
    other: "Other"
  };
  return names[type] || "Other";
}

function openAccountForm(id = null) {
  editingAccountId = id;

  const modal = document.getElementById("accountModal");
  const form = document.getElementById("accountForm");
  if (!modal || !form) return;

  form.reset();

  document.getElementById("accountModalTitle").textContent =
    id === null ? "Add Account" : "Edit Account";

  if (id !== null) {
    const account = accounts.find(item => item.id === id);
    if (!account) return;

    document.getElementById("accountName").value = account.name || "";
    document.getElementById("accountType").value = account.type || "other";
    document.getElementById("accountBalance").value =
      Number(account.balance) || 0;
  }

  modal.classList.add("show");
}

function closeAccountForm() {
  document.getElementById("accountModal")?.classList.remove("show");
  document.getElementById("accountForm")?.reset();
  editingAccountId = null;
}

document.getElementById("accountForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("accountName").value.trim();
  const type = document.getElementById("accountType").value;
  const balance = Number(document.getElementById("accountBalance").value);

  if (!name || !type || !Number.isFinite(balance) || balance < 0) {
    alert("Please enter valid account details.");
    return;
  }

  if (editingAccountId !== null) {
    const account = accounts.find(item => item.id === editingAccountId);
    if (!account) return;

    account.name = name;
    account.type = type;
    account.balance = balance;
  } else {
    accounts.push({
      id: Date.now(),
      name,
      type,
      balance
    });
  }

  saveAccounts();
  renderAccounts();
renderTransferHistory();
  closeAccountForm();
  updateDashboard();
});

function deleteAccount(id) {
  const account = accounts.find(item => item.id === id);
  if (!account) return;

  if (account.balance > 0) {
    alert("Account balance must be zero before deleting it.");
    return;
  }

  if (!confirm(`Delete "${account.name}"?`)) return;

  accounts = accounts.filter(item => item.id !== id);
  saveAccounts();
  renderAccounts();
}

function renderAccounts() {
  const list = document.getElementById("accountsList");
  const totalEl = document.getElementById("accountsTotalBalance");
  if (!list || !totalEl) return;

  const total = accounts.reduce(
    (sum, item) => sum + Number(item.balance || 0),
    0
  );

  totalEl.textContent = "Rs. " + total.toLocaleString();

  if (!accounts.length) {
    list.innerHTML =
      '<p class="empty">No accounts yet. Add your first account.</p>';
    return;
  }

  list.innerHTML = accounts.map(account => `
    <div class="account-card">
      <div class="account-card-top">
        <div>
          <div class="account-name">
            ${accountIcon(account.type)} ${escapeHtml(account.name)}
          </div>
          <small>${accountTypeName(account.type)}</small>
        </div>
        <strong>Rs. ${Number(account.balance || 0).toLocaleString()}</strong>
      </div>

      <div class="account-actions-row">
        <button class="edit-account" onclick="openAccountForm(${account.id})">
          ✏️ Edit
        </button>
        <button class="delete-account" onclick="deleteAccount(${account.id})">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join("");
}

function openTransferForm() {
  if (accounts.length < 2) {
    alert("Add at least two accounts before making a transfer.");
    return;
  }

  const from = document.getElementById("transferFrom");
  const to = document.getElementById("transferTo");

  const options = accounts.map(account =>
    `<option value="${account.id}">
      ${accountIcon(account.type)} ${escapeHtml(account.name)}
      — Rs. ${Number(account.balance || 0).toLocaleString()}
    </option>`
  ).join("");

  from.innerHTML = '<option value="">Select source account</option>' + options;
  to.innerHTML = '<option value="">Select destination account</option>' + options;

  document.getElementById("transferForm").reset();
  document.getElementById("transferFrom").innerHTML =
    '<option value="">Select source account</option>' + options;
  document.getElementById("transferTo").innerHTML =
    '<option value="">Select destination account</option>' + options;

  document.getElementById("transferModal").classList.add("show");
}

function closeTransferForm() {
  document.getElementById("transferModal")?.classList.remove("show");
  document.getElementById("transferForm")?.reset();
}

document.getElementById("transferForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const fromId = Number(document.getElementById("transferFrom").value);
  const toId = Number(document.getElementById("transferTo").value);
  const amount = Number(document.getElementById("transferAmount").value);
  const note = document.getElementById("transferNote").value.trim();

  if (!fromId || !toId || fromId === toId || !Number.isFinite(amount) || amount <= 0) {
    alert("Select two different accounts and enter a valid amount.");
    return;
  }

  const from = accounts.find(item => item.id === fromId);
  const to = accounts.find(item => item.id === toId);

  if (!from || !to) {
    alert("Account not found.");
    return;
  }

  if (Number(from.balance) < amount) {
    alert("Insufficient balance in the source account.");
    return;
  }

  from.balance = Number(from.balance) - amount;
  to.balance = Number(to.balance) + amount;

  transferHistory.push({
    id: Date.now(),
    fromId,
    toId,
    fromName: from.name,
    toName: to.name,
    amount,
    note,
    date: new Date().toISOString().slice(0, 10),
    createdAt: Date.now()
  });

  saveAccounts();
  saveTransferHistory();
  renderAccounts();
  renderTransferHistory();
  closeTransferForm();

  alert(
    `✅ Rs. ${amount.toLocaleString()} transferred from ${from.name} to ${to.name}.`
    + (note ? `\nNote: ${note}` : "")
  );
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderAccounts();


/* =========================
   HOME PROFESSIONAL UI SYNC
   ========================= */
function updateHomeHealthUI() {
  const valueEl = document.getElementById("homeHealthScore");
  const textEl = document.getElementById("homeHealthScoreText");
  const statusEl = document.getElementById("homeHealthStatus");
  if (!valueEl && !textEl && !statusEl) return;

  const scoreEl = document.getElementById("healthScore2Value");
  let score = 0;
  if (scoreEl) {
    const match = String(scoreEl.textContent).match(/\d+/);
    if (match) score = Number(match[0]);
  }
  if (valueEl) valueEl.textContent = score;
  if (textEl) textEl.textContent = score;
  if (statusEl) {
    statusEl.textContent =
      score >= 80 ? "Excellent" :
      score >= 60 ? "Good" :
      score >= 40 ? "Fair" : "Needs Attention";
  }
}


/* ========================================================= INVENTORY + REPORTS */
let inventoryItems=JSON.parse(localStorage.getItem("inventoryItems"))||[];
let inventoryMovements=JSON.parse(localStorage.getItem("inventoryMovements"))||[];
function saveInventoryData(){localStorage.setItem("inventoryItems",JSON.stringify(inventoryItems));localStorage.setItem("inventoryMovements",JSON.stringify(inventoryMovements))}
function openInventoryItemModal(){document.getElementById("inventoryItemModal").classList.add("show");document.getElementById("invItemName").focus()}
function openInventoryStockModal(type){if(!inventoryItems.length){alert("Pehle inventory mein item add karein.");openInventoryItemModal();return}document.getElementById("invMovementType").value=type;document.getElementById("inventoryStockTitle").textContent=type==="in"?"📥 Stock In":"📤 Stock Out";document.getElementById("invMovementItem").innerHTML=inventoryItems.map(i=>`<option value="${i.id}">${escapeHtml(i.name)} — Qty ${i.qty}</option>`).join("");document.getElementById("inventoryStockModal").classList.add("show")}
function closeInventoryModals(){document.querySelectorAll("#inventoryItemModal,#inventoryStockModal").forEach(e=>e.classList.remove("show"))}
function saveInventoryItem(e){e.preventDefault();const item={id:"inv_"+Date.now(),name:document.getElementById("invItemName").value.trim(),category:document.getElementById("invItemCategory").value.trim(),brand:document.getElementById("invItemBrand").value.trim(),qty:Math.max(0,Number(document.getElementById("invItemQty").value||0)),minStock:Math.max(0,Number(document.getElementById("invItemMin").value||0)),cost:Math.max(0,Number(document.getElementById("invItemCost").value||0)),sale:Math.max(0,Number(document.getElementById("invItemSale").value||0)),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};inventoryItems.unshift(item);saveInventoryData();e.target.reset();document.getElementById("invItemQty").value="0";document.getElementById("invItemMin").value="2";document.getElementById("invItemCost").value="0";document.getElementById("invItemSale").value="0";closeInventoryModals();renderInventory();renderInventoryReports()}
function saveInventoryMovement(e){e.preventDefault();const type=document.getElementById("invMovementType").value,itemId=document.getElementById("invMovementItem").value,qty=Math.max(1,Number(document.getElementById("invMovementQty").value||0)),note=document.getElementById("invMovementNote").value.trim(),item=inventoryItems.find(x=>x.id===itemId);if(!item)return;if(type==="out"&&item.qty<qty){alert("Stock itna available nahi hai.");return}item.qty+=type==="in"?qty:-qty;item.updatedAt=new Date().toISOString();inventoryMovements.unshift({id:"mov_"+Date.now(),itemId,type,qty,note,date:new Date().toISOString()});saveInventoryData();document.getElementById("invMovementQty").value="";document.getElementById("invMovementNote").value="";closeInventoryModals();renderInventory();renderInventoryReports()}
function deleteInventoryItem(id){const item=inventoryItems.find(x=>x.id===id);if(!item)return;if(!confirm(`Delete "${item.name}"?`))return;inventoryItems=inventoryItems.filter(x=>x.id!==id);inventoryMovements=inventoryMovements.filter(x=>x.itemId!==id);saveInventoryData();renderInventory();renderInventoryReports()}
function inventoryStatus(i){if(i.qty<=0)return '<span class="inv-status out">Out</span>';if(i.qty<=i.minStock)return '<span class="inv-status low">Low</span>';return '<span class="inv-status ok">In Stock</span>'}
function renderInventory(){const list=document.getElementById("inventoryList");if(!list)return;const search=String(document.getElementById("inventorySearch")?.value||"").toLowerCase(),filter=document.getElementById("inventoryCategoryFilter"),current=filter?.value||"",cats=[...new Set(inventoryItems.map(x=>x.category).filter(Boolean))].sort();if(filter){filter.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");filter.value=cats.includes(current)?current:""}const visible=inventoryItems.filter(i=>(!search||`${i.name} ${i.category} ${i.brand}`.toLowerCase().includes(search))&&(!current||i.category===current));list.innerHTML=visible.length?visible.map(i=>`<div class="inventory-row"><div><strong>${escapeHtml(i.name)}</strong><small>${escapeHtml(i.brand||"—")}</small></div><span>${escapeHtml(i.category)}</span><strong>${i.qty}</strong><span>Rs. ${Number(i.sale||0).toLocaleString()}</span>${inventoryStatus(i)}<button class="inv-delete" onclick="deleteInventoryItem('${i.id}')">🗑️</button></div>`).join(""):'<div class="inventory-empty">📦 No inventory items yet. Add your first item.</div>';const value=inventoryItems.reduce((s,i)=>s+Number(i.qty||0)*Number(i.cost||0),0),low=inventoryItems.filter(i=>i.qty>0&&i.qty<=i.minStock).length,out=inventoryItems.filter(i=>i.qty<=0).length,set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set("inventoryTotalItems",inventoryItems.length);set("inventoryStockValue","Rs. "+value.toLocaleString());set("inventoryLowStock",low);set("inventoryOutStock",out);const a=document.getElementById("inventoryAlert");if(a){a.style.display=low+out?"block":"none";a.innerHTML=`⚠️ <strong>${low+out}</strong> item(s) need attention.`}}
function renderInventoryReports(){const value=inventoryItems.reduce((s,i)=>s+Number(i.qty||0)*Number(i.cost||0),0),units=inventoryItems.reduce((s,i)=>s+Number(i.qty||0),0),sin=inventoryMovements.filter(x=>x.type==="in").reduce((s,x)=>s+Number(x.qty||0),0),sout=inventoryMovements.filter(x=>x.type==="out").reduce((s,x)=>s+Number(x.qty||0),0),total=sin+sout,inPct=total?Math.round(sin/total*100):0,outPct=total?100-inPct:0,set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set("invReportStockValue","Rs. "+value.toLocaleString());set("invReportUnits",units);set("invReportStockIn",sin);set("invReportStockOut",sout);set("invInPercent",inPct+"%");set("invOutPercent",outPct+"%");const ib=document.getElementById("invInBar"),ob=document.getElementById("invOutBar");if(ib)ib.style.width=inPct+"%";if(ob)ob.style.width=outPct+"%";const cats={};inventoryItems.forEach(i=>{const k=i.category||"Other";if(!cats[k])cats[k]={items:0,units:0,value:0};cats[k].items++;cats[k].units+=Number(i.qty||0);cats[k].value+=Number(i.qty||0)*Number(i.cost||0)});const cr=document.getElementById("inventoryCategoryReport");if(cr)cr.innerHTML=Object.entries(cats).length?Object.entries(cats).map(([n,d])=>`<div class="inventory-report-row"><span>🏷️ ${escapeHtml(n)}</span><small>${d.items} items • ${d.units} units</small><strong>Rs. ${d.value.toLocaleString()}</strong></div>`).join(""):'<div class="inventory-empty">No category data yet.</div>';const lr=document.getElementById("inventoryLowStockReport"),low=inventoryItems.filter(i=>i.qty<=i.minStock);if(lr)lr.innerHTML=low.length?low.map(i=>`<div class="inventory-report-row"><span>⚠️ ${escapeHtml(i.name)}</span><small>${escapeHtml(i.category)} • Minimum ${i.minStock}</small><strong>${i.qty} left</strong></div>`).join(""):'<div class="inventory-empty">✅ No low-stock items.</div>'}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
const _inventoryBaseShowScreen=window.showScreen;
window.showScreen=function(screenId,button){if(typeof _inventoryBaseShowScreen==="function")_inventoryBaseShowScreen(screenId,button);if(screenId==="inventoryScreen")renderInventory();if(screenId==="inventoryReportsScreen")renderInventoryReports()};

/* =========================
   FINAL APP STARTUP
   ========================= */

try {
  setupReportMonths();
  updateDashboard();
  updateReports();
  updateBudget();
  renderSavingsGoals();
  renderDebts();
  renderAccounts();
  renderTransferHistory();
  renderBills();
  updateFinancialHealth2();
  updateProfessionalKpi();
} catch (error) {
  console.error("Finance Manager startup error:", error);
}


const DEFAULT_PIN = "1234";

let appPIN =
  localStorage.getItem("appPIN") || DEFAULT_PIN;


// ==========================
// CHANGE PIN
// ==========================

function changePIN() {

  const oldPIN =
    prompt("Enter current PIN:");

  if (oldPIN !== appPIN) {

    alert("Incorrect PIN.");

    return;
  }

  const newPIN =
    prompt("Enter new 4-digit PIN:");

  if (!/^\d{4}$/.test(newPIN)) {

    alert("PIN must be exactly 4 digits.");

    return;
  }

  const confirmPIN =
    prompt("Confirm new PIN:");

  if (newPIN !== confirmPIN) {

    alert("PINs do not match.");

    return;
  }

  appPIN = newPIN;

  localStorage.setItem(
    "appPIN",
    appPIN
  );

  alert("PIN changed successfully.");
}


// ==========================
// BACKUP
// ==========================

function backupData() {

  const backup = {
    accounts: accounts,

    version: 1,

    backupDate:
      new Date().toISOString(),

    incomeData: incomeData,

    expenseData: expenseData,

    monthlyBudget: monthlyBudget,

    categoryBudgets: categoryBudgets,

    savingsGoals: savingsGoals,

    debts: debts

  };


  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  const blob =
    new Blob(
      [json],
      { type: "application/json" }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "Personal-Finance-Backup.json";

  link.click();

  URL.revokeObjectURL(url);

  alert("Backup created successfully.");
}


// ==========================
// RESTORE
// ==========================

function restoreData(event) {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function(e) {

    try {

      const backup =
        JSON.parse(e.target.result);


      if (
        !backup.incomeData ||
        !backup.expenseData
      ) {

        alert("Invalid backup file.");

        return;
      }


      if (
        !confirm(
          "Restore this backup? Current data will be replaced."
        )
      ) {

        return;
      }


      incomeData =
        backup.incomeData || [];

      expenseData =
        backup.expenseData || [];

      monthlyBudget =
        Number(
          backup.monthlyBudget
        ) || 0;

      categoryBudgets =
        backup.categoryBudgets || {};

      savingsGoals =
        backup.savingsGoals || [];

      debts =
        backup.debts || [];

      recurringTransactions =
        backup.recurringTransactions || [];


      saveData();

      saveBudgetData();

      saveSavingsGoals();

      saveDebts();


      updateDashboard();

      updateReports();

      updateBudget();

      renderSavingsGoals();

      renderDebts();


      alert(
        "Backup restored successfully."
      );

    } catch (error) {

      alert(
        "Could not read backup file."
      );

    }

  };

  reader.readAsText(file);

}


// ==========================
// CLEAR ALL DATA
// ==========================

function clearAllData() {

  const pin =
    prompt("Enter PIN to continue:");

  if (pin !== appPIN) {

    alert("Incorrect PIN.");

    return;
  }


  const confirmation =
    prompt(
      'Type "DELETE" to permanently clear all data:'
    );

  if (confirmation !== "DELETE") {

    alert("Operation cancelled.");

    return;
  }


  localStorage.clear();

  incomeData = [];

  expenseData = [];

  monthlyBudget = 0;

  categoryBudgets = {};

  savingsGoals = [];

  debts = [];

  recurringTransactions = [];


  alert(
    "All finance data has been deleted."
  );

  location.reload();
}

function showScreen(screenId, button) {

  document.querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const selectedScreen =
    document.getElementById(screenId);

  if (selectedScreen) {
    selectedScreen.classList.add("active");
  }

  document.querySelectorAll(".bottom-nav button")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


  function unlockApp() {

  const enteredPIN =
    document.getElementById("loginPIN").value;

  const error =
    document.getElementById("pinError");

  if (enteredPIN === appPIN) {

    document
      .getElementById("pinScreen")
      .classList.add("hidden");

    document.getElementById("loginPIN").value = "";

    error.textContent = "";

  } else {

    error.textContent =
      "❌ Incorrect PIN";

    document.getElementById("loginPIN").value = "";

  }
}


document
  .getElementById("loginPIN")
  .addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
      unlockApp();
    }

  });
