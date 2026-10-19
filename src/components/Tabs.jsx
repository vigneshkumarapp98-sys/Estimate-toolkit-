import React, { useState } from "react";
import { Field, RowsTable } from "./Fields.jsx";
import { blank, fmt, num, sum } from "../lib/model.js";
import { validateEstimate } from "../lib/validate.js";

export function CommonTab({ d, upd }) {
  const c = d.common;
  return (
    <div className="grid">
      <Field label="Applicant name" value={c.applicantName} onChange={(v) => upd(["common", "applicantName"], v)} />
      <Field label="Address" value={c.address} onChange={(v) => upd(["common", "address"], v)} />
      <Field label="SC No" value={c.scNo} onChange={(v) => upd(["common", "scNo"], v)} />
      <Field label="Load" value={c.load} onChange={(v) => upd(["common", "load"], v)} />
      <Field label="Estimate cost (Rs)" type="number" value={c.estimateCost} onChange={(v) => upd(["common", "estimateCost"], v)} />
    </div>
  );
}

export function LetterTab({ d, upd }) {
  const l = d.letter;
  const f = (k, label, rows) => <Field key={k} label={label} rows={rows} value={l[k]} onChange={(v) => upd(["letter", k], v)} />;
  return (
    <div className="grid">
      {f("from", "From", 3)}{f("to", "To", 3)}{f("lrNo", "Lr No / Date")}{f("subject", "Subject", 3)}
      {f("ref", "Ref", 2)}{f("body", "Body", 8)}{f("enclosure", "Enclosure")}{f("signatory", "Signatory")}
      <button onClick={() => upd(["letter", "subject"], `Sub: Elecy - ${d.common.scNo} - ${d.common.applicantName}, ${d.common.address} - ${d.common.load}`)}>
        Fill subject from common data
      </button>
    </div>
  );
}

const LOAD_COLS = [
  { key: "feeder", label: "Feeder" },
  { key: "agriNos", label: "Agri Nos", type: "number" }, { key: "agriHp", label: "Agri HP", type: "number" },
  { key: "indNos", label: "Ind Nos", type: "number" }, { key: "indHp", label: "Ind HP", type: "number" },
  { key: "domNos", label: "Dom Nos", type: "number" }, { key: "domHp", label: "Dom HP", type: "number" },
  { key: "newNos", label: "New Nos", type: "number" }, { key: "newHp", label: "New HP", type: "number" },
];

export function ReportTab({ d, upd }) {
  const r = d.report;
  const setSec = (i, k, v) => upd(["report", "loadDetails", i, k], v);
  return (
    <div className="grid">
      <Field label="Scope" rows={3} value={r.scope} onChange={(v) => upd(["report", "scope"], v)} />
      <Field label="Point of supply" rows={3} value={r.pointOfSupply} onChange={(v) => upd(["report", "pointOfSupply"], v)} />
      <h3>Main features</h3>
      <RowsTable columns={[{ key: "item", label: "Item" }, { key: "qty", label: "Qty", type: "number" }, { key: "unit", label: "Unit" }]}
        rows={r.mainFeatures} blank={blank.feature} onChange={(v) => upd(["report", "mainFeatures"], v)} />
      <h3>Load details</h3>
      {r.loadDetails.map((s, i) => (
        <div className="card" key={i}>
          <Field label="Section title" value={s.title} onChange={(v) => setSec(i, "title", v)} />
          <RowsTable columns={LOAD_COLS} rows={s.rows} blank={blank.loadRow} onChange={(v) => setSec(i, "rows", v)}
            footer={<tr><td>Total</td>{LOAD_COLS.slice(1).map((c) => <td key={c.key} className="calc">{sum(s.rows, c.key)}</td>)}<td /></tr>} />
          <button className="danger" onClick={() => upd(["report", "loadDetails"], r.loadDetails.filter((_, j) => j !== i))}>Remove section</button>
        </div>
      ))}
      <button onClick={() => upd(["report", "loadDetails"], [...r.loadDetails, blank.loadSection()])}>+ Add load section</button>
      <Field label="Regulation %" type="number" value={r.regulationPercent} onChange={(v) => upd(["report", "regulationPercent"], v)} />
      <h3>Estimate cost lines</h3>
      <RowsTable columns={[{ key: "label", label: "Description" }, { key: "gross", label: "Gross Rs", type: "number" }, { key: "net", label: "Net Rs", type: "number" }]}
        rows={r.estimateCostLines} blank={blank.costLine} onChange={(v) => upd(["report", "estimateCostLines"], v)} />
      <Field label="Consumer paid amount (Rs)" type="number" value={r.consumerPaid} onChange={(v) => upd(["report", "consumerPaid"], v)} />
    </div>
  );
}

export function RegulationTab({ d, upd }) {
  const fs = d.regulation.feeders;
  const setF = (i, k, v) => upd(["regulation", "feeders", i, k], v);
  return (
    <div className="grid">
      {fs.map((f, i) => (
        <div className="card" key={i}>
          <Field label="Feeder name" value={f.name} onChange={(v) => setF(i, "name", v)} />
          <Field label="SC No" value={f.scNo} onChange={(v) => setF(i, "scNo", v)} />
          <Field label="Load (HP)" type="number" value={f.loadHp} onChange={(v) => setF(i, "loadHp", v)} />
          <RowsTable columns={[{ key: "conductor", label: "Conductor" }, { key: "constant", label: "Constant", type: "number" },
            { key: "distance", label: "Distance (m)", type: "number" }, { key: "loadHp", label: "Load HP", type: "number" }]}
            rows={f.conductors} blank={blank.conductor} onChange={(v) => setF(i, "conductors", v)} />
          <button className="danger" onClick={() => upd(["regulation", "feeders"], fs.filter((_, j) => j !== i))}>Remove feeder</button>
        </div>
      ))}
      <button onClick={() => upd(["regulation", "feeders"], [...fs, blank.feeder()])}>+ Add feeder</button>
      <p className="note">Regulation formulas are not implemented yet; values are stored as data only.</p>
    </div>
  );
}

const MAT_COLS = [{ key: "desc", label: "Description" }, { key: "qty", label: "Qty", type: "number" }, { key: "unit", label: "Unit" }, { key: "rate", label: "Rate", type: "number" }];
const amount = (r) => num(r.qty) * num(r.rate);
const MAT_SECTIONS = [["dismantled", "A) Dismantled in the old site"], ["reusable", "B) Reusable materials"], ["structure", "Structure materials"], ["scrap", "D/E) Scrap (non-usable)"]];

export function MaterialsTab({ d, upd }) {
  const m = d.materials, bv = m.bookValue;
  const total = (k) => m[k].reduce((a, r) => a + amount(r), 0);
  const reusableTotal = total("reusable") + total("structure");
  const rounded = Math.round(reusableTotal / 10) * 10;
  const wdvPct = 100 - num(bv.servedYears) * num(bv.depreciationRate);
  return (
    <div className="grid">
      {MAT_SECTIONS.map(([k, label]) => (
        <div className="card" key={k}>
          <h3>{label}</h3>
          <RowsTable columns={MAT_COLS} rows={m[k]} blank={blank.mrow} onChange={(v) => upd(["materials", k], v)}
            extra={{ label: "Amount", fn: (r) => fmt(amount(r)) }}
            footer={<tr><td colSpan={4}>Total</td><td className="calc">{fmt(total(k))}</td><td /></tr>} />
        </div>
      ))}
      <div className="card">
        <h3>C) Book value</h3>
        <Field label="Life period of line materials (years)" type="number" value={bv.lifeYears} onChange={(v) => upd(["materials", "bookValue", "lifeYears"], v)} />
        <Field label="Actual life period served (years)" type="number" value={bv.servedYears} onChange={(v) => upd(["materials", "bookValue", "servedYears"], v)} />
        <Field label="Rate of depreciation (%)" type="number" value={bv.depreciationRate} onChange={(v) => upd(["materials", "bookValue", "depreciationRate"], v)} />
        <p>Reusable + structure total: <b>{fmt(reusableTotal)}</b> (rounded {fmt(rounded)})</p>
        <p>Written down value %: <b>{fmt(wdvPct)}</b> → Written down value: <b>{fmt((rounded * wdvPct) / 100)}</b></p>
      </div>
    </div>
  );
}

export function PolesTab({ d, upd }) {
  const p = d.poles;
  const [newCol, setNewCol] = useState("");
  const cols = [{ key: "loc", label: "Loc no" }, { key: "span", label: "Span (m)", type: "number" }, ...p.columns.map((c) => ({ key: c, label: c, type: "number" }))];
  return (
    <div className="grid">
      <RowsTable columns={cols} rows={p.rows} blank={() => ({ loc: "", span: 0 })} onChange={(v) => upd(["poles", "rows"], v)}
        footer={<tr><td>Total</td>{cols.slice(1).map((c) => <td key={c.key} className="calc">{sum(p.rows, c.key)}</td>)}<td /></tr>} />
      <div className="row">
        <input placeholder="New material column" value={newCol} onChange={(e) => setNewCol(e.target.value)} />
        <button onClick={() => { const n = newCol.trim(); if (n && !p.columns.includes(n)) { upd(["poles", "columns"], [...p.columns, n]); setNewCol(""); } }}>+ Add column</button>
        <button className="danger" onClick={() => p.columns.length && upd(["poles", "columns"], p.columns.slice(0, -1))}>Remove last column</button>
      </div>
    </div>
  );
}

export function JsonTab({ d, replace }) {
  const [text, setText] = useState(JSON.stringify(d, null, 2));
  const [err, setErr] = useState([]);
  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      const errors = validateEstimate(parsed);
      if (errors.length) return setErr(errors);
      setErr([]);
      replace(parsed);
    } catch (e) { setErr(["Invalid JSON: " + e.message]); }
  };
  return (
    <div className="grid">
      <textarea className="json" rows={22} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="row">
        <button onClick={apply}>Apply JSON to form</button>
        <button onClick={() => setText(JSON.stringify(d, null, 2))}>Reload from form</button>
      </div>
      {err.length > 0 && <ul className="errs">{err.map((e, i) => <li key={i}>{e}</li>)}</ul>}
    </div>
  );
}
