import React, { useEffect, useRef, useState } from "react";
import Editor from "./components/Editor.jsx";
import { deleteEstimate, listEstimates, saveEstimate } from "./lib/storage.js";
import { newEstimate, uid } from "./lib/model.js";
import { validateEstimate } from "./lib/validate.js";
import { downloadJson } from "./lib/files.js";

export default function App() {
  const [list, setList] = useState([]);
  const [cur, setCur] = useState(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const refresh = async () => setList(await listEstimates());
  useEffect(() => { refresh(); }, []);

  const create = () => setCur(newEstimate());
  const dup = async (e) => { await saveEstimate({ ...e, id: uid(), title: e.title + " (copy)" }); refresh(); };
  const del = async (e) => { if (confirm(`Delete "${e.title}"?`)) { await deleteEstimate(e.id); refresh(); } };

  const importFile = async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const items = Array.isArray(data) ? data : [data];
      const bad = items.map((x, i) => ({ i, errs: validateEstimate(x) })).filter((x) => x.errs.length);
      if (bad.length) return setMsg(`Import failed. Item ${bad[0].i + 1}: ${bad[0].errs.slice(0, 3).join("; ")}`);
      for (const it of items) await saveEstimate(it);
      setMsg(`Imported ${items.length} estimate(s)`);
      refresh();
    } catch (e) { setMsg("Import failed: " + e.message); }
  };

  if (cur) return <Editor key={cur.id} initial={cur} onBack={() => { setCur(null); refresh(); }} />;
  return (
    <div className="page">
      <h1>Estimates</h1>
      <div className="bar">
        <button className="primary" onClick={create}>+ New estimate</button>
        <button onClick={() => fileRef.current.click()}>Import JSON</button>
        <button onClick={() => downloadJson(list, "estimates-all.json")} disabled={!list.length}>Export all</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
      </div>
      {msg && <div className="msg">{msg}</div>}
      {list.length === 0 ? <p className="note">No estimates yet. Create one or import a JSON file.</p> : (
        <div className="tw"><table>
          <thead><tr><th>Title</th><th>Applicant</th><th>SC No</th><th>Updated</th><th /></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td><td>{e.common?.applicantName}</td><td>{e.common?.scNo}</td>
              <td>{new Date(e.updatedAt).toLocaleString()}</td>
              <td className="acts"><button onClick={() => setCur(e)}>Open</button><button onClick={() => dup(e)}>Duplicate</button><button className="danger" onClick={() => del(e)}>Delete</button></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </div>
  );
}
