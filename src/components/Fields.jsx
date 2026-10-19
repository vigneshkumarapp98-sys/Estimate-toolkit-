import React from "react";

const parse = (type, v) => (type === "number" ? (v === "" ? 0 : parseFloat(v)) : v);

export function Field({ label, value, onChange, type = "text", rows }) {
  const h = (e) => onChange(parse(type, e.target.value));
  return (
    <label className="f">
      <span>{label}</span>
      {rows ? (
        <textarea rows={rows} value={value ?? ""} onChange={h} />
      ) : (
        <input type={type} step={type === "number" ? "any" : undefined} value={value ?? ""} onChange={h} />
      )}
    </label>
  );
}

// Editable table. columns: [{key,label,type?}], rows: array of objects.
export function RowsTable({ columns, rows, onChange, blank, extra, footer, addLabel = "+ Add row" }) {
  const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            {extra && <th>{extra.label}</th>}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key}>
                  <input
                    type={c.type === "number" ? "number" : "text"}
                    step="any"
                    value={r[c.key] ?? ""}
                    onChange={(e) => set(i, c.key, parse(c.type, e.target.value))}
                  />
                </td>
              ))}
              {extra && <td className="calc">{extra.fn(r)}</td>}
              <td><button className="x" title="Remove row" onClick={() => onChange(rows.filter((_, j) => j !== i))}>✕</button></td>
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
      <button onClick={() => onChange([...rows, blank()])}>{addLabel}</button>
    </div>
  );
}
