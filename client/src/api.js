const BASE = "http://localhost:3001";

async function request(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  // যদি server error দেয়
  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const err = await res.json();
      errorMessage = err.error || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return res.json();
}

const api = {
  // Tours
  getTours: () => request("GET", "/tours"),
  createTour: (name) => request("POST", "/tours", { name }),
  getTour: (id) => request("GET", `/tours/${id}`),
  deleteTour: (id) => request("DELETE", `/tours/${id}`),
  endTour: (id) => request("PATCH", `/tours/${id}/end`),
  reopenTour: (id) => request("PATCH", `/tours/${id}/reopen`),

  // Payment methods
  addPaymentMethod: (tourId, name) =>
    request("POST", `/tours/${tourId}/payment-methods`, { name }),

  // Members
  addMember: (tourId, name) =>
    request("POST", `/tours/${tourId}/members`, { name }),

  deleteMember: (tourId, memberId) =>
    request("DELETE", `/tours/${tourId}/members/${memberId}`),

  // Deposits
  addDeposit: (tourId, payload) =>
    request("POST", `/tours/${tourId}/deposits`, payload),

  deleteDeposit: (tourId, depositId) =>
    request("DELETE", `/tours/${tourId}/deposits/${depositId}`),

  // Expenses
  addExpense: (tourId, payload) =>
    request("POST", `/tours/${tourId}/expenses`, payload),

  deleteExpense: (tourId, expenseId) =>
    request("DELETE", `/tours/${tourId}/expenses/${expenseId}`),

  // Balances
  getBalances: (tourId) =>
    request("GET", `/tours/${tourId}/balances`),
};

export default api;