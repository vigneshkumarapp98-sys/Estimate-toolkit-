import React, { useState } from "react";
import { setIn } from "../lib/model.js";
import { validateEstimate } from "../lib/validate.js";
import { saveEstimate } from "../lib/storage.js";
import { downloadJson } from "../lib/files.js";
import { CommonTab, LetterTab, ReportTab, RegulationTab, MaterialsTab, PolesTab, JsonTab } from "./Tabs.jsx";

const TABS = [["common", "Common", CommonTab], ["letter", "Estimate Letter", LetterTab], ["report", "Report", ReportTab],
  ["regulation", "LT Regulation", RegulationTab], ["materials", "Materials Valuation", MaterialsTab], ["poles", "Pole Schedule", PolesTab], ["json", "JSON", JsonTab]];

export default function Editor({ initial, onBack }) {
  const [d, setD] = useState(initial);
  const [tab, setTab] = useState("common");
  const [errors, setErrors] = useState([]);
  const [msg, setMsg] = useState("");
  const [jsonKey, setJsonKey] = useState(0);
  const upd = (path, value) => { setD((x) => setIn(x, path, value)); setMsg(""); };
  const replace = (obj) => { setD(obj); setJsonKey((k) => k + 1); setMsg("JSON applied (not saved yet)"); };

  const save = async () => {
    const errs = validateEstimate(d);
    setErrors(errs);
    if (errs.length) return setMsg("Not saved – fix the errors below");
    const saved = await saveEstimate(d);
    setD(saved);
    setMsg("Saved " + new Date().toLocaleTimeString());
  };
  const Active = TABS.find((t) => t[0] === tab)[2];

  return (
    <div className="page">
      <div className="bar">
        <button onClick={onBack}>← List</button>
        <input className="title" value={d.title} onChange={(e) => upd(["title"], e.target.value)} />
        <button className="primary" onClick={save}>Save</button>
        <button onClick={() => downloadJson(d, (d.title || "estimate").replace(/\W+/g, "_") + ".json")}>Export JSON</button>
      </div>
      {msg && <div className="msg">{msg}</div>}
      {errors.length > 0 && <ul className="errs">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
      <nav className="tabs">{TABS.map(([k, label]) => <button key={k} className={k === tab ? "on" : ""} onClick={() => setTab(k)}>{label}</button>)}</nav>
      <Active key={tab + jsonKey} d={d} upd={upd} replace={replace} />
    </div>
  );
}
