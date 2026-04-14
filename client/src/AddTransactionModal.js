import React, { useState } from 'react';
import { fmt, Icon, ICONS } from './shared';

const DEFAULT_METHODS = ['Cash', 'Bank', 'bKash', 'Nagad'];

export default function AddTransactionModal({
  data,
  setData,
  tourId,
  members,
  paymentMethods,
  totalDeposit,
  totalExpense,
  onClose,
  onSaved,
  showToast
}) {
  const [type,          setType]          = useState('deposit');
  const [memberId,      setMemberId]      = useState(members[0]?.id || '');
  const [amount,        setAmount]        = useState('');
  const [title,         setTitle]         = useState('');
  const [note,          setNote]          = useState('');
  const [paidBy,        setPaidBy]        = useState(members[0]?.id || '');
  const [splitType,     setSplitType]     = useState('equal');
  const [splits,        setSplits]        = useState(
    members.map(m => ({ memberId: m.id, included: true, amount: 0 }))
  );
  const [payMethod,     setPayMethod]     = useState((paymentMethods || DEFAULT_METHODS)[0] || 'Cash');
  const [showNewMethod, setShowNewMethod] = useState(false);
  const [newMethod,     setNewMethod]     = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  const allMethods = paymentMethods?.length ? paymentMethods : DEFAULT_METHODS;
  const amt = parseFloat(amount) || 0;
  const includedCount = splits.filter(s => s.included).length;
  const equalShare = includedCount ? amt / includedCount : 0;
  const customTotal = splits.reduce((s, x) => s + (x.amount || 0), 0);

  const toggleSplit = (idx) =>
    setSplits(prev => prev.map((s, i) => i === idx ? { ...s, included: !s.included } : s));

  const setSplitAmt = (idx, val) =>
    setSplits(prev => prev.map((s, i) => i === idx ? { ...s, amount: parseFloat(val) || 0 } : s));

  const addCustomMethod = async () => {
    if (!newMethod.trim()) return;
    try {
      //await api.addPaymentMethod(tourId, newMethod.trim());
      setPayMethod(newMethod.trim());
      setNewMethod('');
      setShowNewMethod(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const submit = async () => {
  setError('');

  if (amt <= 0) return setError('Enter a valid amount');

  try {
    setLoading(true);

    if (type === 'deposit') {
      if (!memberId) return setError('Select a member');

      setData(prev => ({
        ...prev,
        deposits: [
          ...(prev.deposits || []),
          {
            id: Date.now().toString(),
            member_id: memberId,
            amount: amt,
            note,
            paymentMethod: payMethod,
            created_at: new Date().toISOString()
          }
        ]
      }));

      showToast('Deposit added ✓');

    } else {
      if (!title.trim()) return setError('Enter a title');
      if (!paidBy) return setError('Select who paid');

      const finalSplits =
        splitType === 'equal'
          ? splits.map(s => ({
              ...s,
              amount: s.included ? equalShare : 0
            }))
          : splits;

      setData(prev => ({
        ...prev,
        expenses: [
          ...(prev.expenses || []),
          {
            id: Date.now().toString(),
            title: title.trim(),
            amount: amt,
            paid_by: paidBy,
            split_type: splitType,
            splits: finalSplits,
            paymentMethod: payMethod,
            created_at: new Date().toISOString()
          }
        ]
      }));

      showToast('Expense added ✓');
    }

    onSaved();
    onClose();

  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Transaction</div>

        {/* Type */}
        <div className="field">
          <label>Type</label>
          <div className="chips">
            <div className={`chip${type === 'deposit' ? ' active' : ''}`} onClick={() => setType('deposit')}>💰 Deposit</div>
            <div className={`chip${type === 'expense' ? ' active' : ''}`} onClick={() => setType('expense')}>🧾 Expense</div>
          </div>
        </div>

        {/* Amount + Payment Method */}
        <div className="row">
          <div className="field">
            <label>Amount (৳)</label>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label>Payment</label>
            <select value={payMethod} onChange={e => {
              if (e.target.value === '__new__') setShowNewMethod(true);
              else setPayMethod(e.target.value);
            }}>
              {allMethods.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="__new__">+ Add new…</option>
            </select>
          </div>
        </div>

        {showNewMethod && (
          <div className="add-method-row" style={{ marginBottom: 16 }}>
            <input className="add-method-input" placeholder="e.g. Rocket"
              value={newMethod} onChange={e => setNewMethod(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomMethod()} />
            <button className="btn btn-ghost btn-sm" onClick={addCustomMethod}>Add</button>
          </div>
        )}

        {/* ── Deposit fields ── */}
        {type === 'deposit' && (
          <>
            <div className="field">
              <label>Member</label>
              <select value={memberId} onChange={e => setMemberId(e.target.value)}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Note (optional)</label>
              <input placeholder="e.g. Cash from wallet" value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </>
        )}

        {/* ── Expense fields ── */}
        {type === 'expense' && (
          <>
            <div className="field">
              <label>Title</label>
              <input placeholder="Lunch, Hotel, Bus…" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label>Paid by</label>
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Split Type</label>
              <div className="chips">
                <div className={`chip${splitType === 'equal' ? ' active' : ''}`} onClick={() => setSplitType('equal')}>⚖️ Equal</div>
                <div className={`chip${splitType === 'custom' ? ' active' : ''}`} onClick={() => setSplitType('custom')}>✏️ Custom</div>
              </div>
            </div>

            {splitType === 'equal' && (
              <div style={{ marginBottom: 16 }}>
                <div className="info-box">Each included member pays {fmt(equalShare)}</div>
                {members.map((m, i) => (
                  <div key={m.id} className="split-row">
                    <button
                      className={`split-toggle${splits[i]?.included ? ' on' : ''}`}
                      onClick={() => toggleSplit(i)}
                    >
                      {splits[i]?.included && <Icon d={ICONS.check} size={12} />}
                    </button>
                    <span className="split-name">{m.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                      {splits[i]?.included ? fmt(equalShare) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {splitType === 'custom' && (
              <div style={{ marginBottom: 16 }}>
                <div className={`info-box${Math.abs(customTotal - amt) > 0.01 ? '' : ''}`}
                  style={Math.abs(customTotal - amt) > 0.01 ? { background: 'rgba(255,77,109,.08)', borderColor: 'rgba(255,77,109,.3)', color: 'var(--red)' } : {}}>
                  Assigned: {fmt(customTotal)} / {fmt(amt)}
                  {Math.abs(customTotal - amt) > 0.01 && '  ⚠ must match total'}
                </div>
                {members.map((m, i) => (
                  <div key={m.id} className="split-row">
                    <span className="split-name">{m.name}</span>
                    <input className="split-input" type="number" min="0" step="0.01" placeholder="0"
                      value={splits[i]?.amount || ''} onChange={e => setSplitAmt(i, e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!members.length && (
          <div className="warn-box">⚠ Add members first from the Members tab before adding transactions.</div>
        )}

        {/* Overspend warning for expenses — warn but don't block */}
        {type === 'expense' && amt > 0 && (() => {
          const newTotal = totalExpense + amt;
          if (newTotal > totalDeposit) {
            return (
              <div className="overspend-box">
                ⚠️ <strong>Insufficient funds.</strong> You are overspending by {fmt(newTotal - totalDeposit)}. The expense will still be saved.
              </div>
            );
          }
          return null;
        })()}

        {error && <div className="warn-box">⚠ {error}</div>}

        <button className="btn btn-primary" onClick={submit} disabled={loading || !members.length}>
          {loading ? 'Saving…' : <><Icon d={ICONS.check} /> Save Transaction</>}
        </button>
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
