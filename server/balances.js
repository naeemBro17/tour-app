/**
 * Calculate per-member balances and minimum settlements for a tour.
 */

function calcBalances(members, deposits, expenses) {
  const bal = {};
  members.forEach(m => {
    bal[m.id] = { memberId: m.id, name: m.name, deposits: 0, share: 0 };
  });

  deposits.forEach(d => {
    if (bal[d.member_id]) bal[d.member_id].deposits += d.amount;
  });

  expenses.forEach(e => {
    const splits = e.splits || [];
    if (e.split_type === 'equal') {
      const included = splits.filter(s => s.included);
      const share = included.length ? e.amount / included.length : 0;
      included.forEach(s => {
        if (bal[s.member_id]) bal[s.member_id].share += share;
      });
    } else {
      splits.forEach(s => {
        if (bal[s.member_id]) bal[s.member_id].share += s.amount || 0;
      });
    }
  });

  return Object.values(bal).map(b => ({
    ...b,
    balance: parseFloat((b.deposits - b.share).toFixed(2)),
  }));
}

function minSettlements(balances) {
  const creditors = balances
    .filter(b => b.balance > 0.01)
    .map(b => ({ ...b, net: b.balance }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter(b => b.balance < -0.01)
    .map(b => ({ ...b, net: b.balance }))
    .sort((a, b) => a.net - b.net);

  const txns = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].net, creditors[j].net);
    txns.push({
      from:       debtors[i].name,
      fromId:     debtors[i].memberId,
      to:         creditors[j].name,
      toId:       creditors[j].memberId,
      amount:     parseFloat(amount.toFixed(2)),
    });
    debtors[i].net   += amount;
    creditors[j].net -= amount;
    if (Math.abs(debtors[i].net)   < 0.01) i++;
    if (Math.abs(creditors[j].net) < 0.01) j++;
  }

  return txns;
}

module.exports = { calcBalances, minSettlements };
