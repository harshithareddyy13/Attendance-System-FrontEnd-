import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Generic list + add/edit/delete screen.
 * columns: [{ key, label, render?(row) }]
 * fields:  [{ name, label, type?, required?, lockOnEdit?, placeholder?, options? }]
 */
export default function CrudPage({ title, singular, path, columns, fields, defaults = {}, intro }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null); // null = dialog closed
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await api.get(path));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { load(); }, [load]);

  const isEdit = form && form.id != null;

  function openAdd() { setFormError(''); setForm({ ...defaults }); }
  function openEdit(row) {
    setFormError('');
    const values = { id: row.id };
    fields.forEach((f) => { values[f.name] = row[f.name] ?? ''; });
    if (fields.some((f) => f.type === 'password')) {
      fields.filter((f) => f.type === 'password').forEach((f) => { values[f.name] = ''; });
    }
    setForm(values);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const body = {};
      fields.forEach((f) => {
        const v = form[f.name];
        if (f.type === 'number') body[f.name] = v === '' ? null : Number(v);
        else if (f.type === 'select') body[f.name] = v === '' || v == null ? null : Number(v);
        else body[f.name] = v;
      });
      if (isEdit) await api.put(`${path}/${form.id}`, body);
      else await api.post(path, body);
      setForm(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Delete this ${singular}? Their attendance records are deleted too.`)) return;
    try {
      await api.del(`${path}/${row.id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          {intro && <p className="muted">{intro}</p>}
        </div>
        <button className="btn primary" onClick={openAdd}>Add {singular}</button>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={columns.length + 1} className="empty">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="empty">
                No {title.toLowerCase()} yet. Use “Add {singular}” to create the first one.
              </td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
                <td className="actions">
                  <button className="link" onClick={() => openEdit(row)}>Edit</button>
                  <button className="link danger" onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}>
          <form className="dialog" onSubmit={save}>
            <h2>{isEdit ? `Edit ${singular}` : `Add ${singular}`}</h2>
            {formError && <div className="alert error">{formError}</div>}
            <div className="form-grid">
              {fields.map((f) => (
                <label key={f.name}>
                  <span>{f.label}</span>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.name] ?? ''}
                      required={f.required}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    >
                      <option value="">{f.emptyLabel || 'Select…'}</option>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.name] ?? ''}
                      required={f.required && !(f.type === 'password' && isEdit)}
                      disabled={f.lockOnEdit && isEdit}
                      placeholder={isEdit && f.type === 'password' ? 'Leave blank to keep current' : f.placeholder}
                      min={f.type === 'number' ? 1 : undefined}
                      max={f.type === 'number' ? 12 : undefined}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : `Add ${singular}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
