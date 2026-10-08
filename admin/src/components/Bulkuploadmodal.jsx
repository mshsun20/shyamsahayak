import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Upload, Download } from "lucide-react";
import Modal from "./Modal";
import axiosInstance from "../config/axiosInstance";
import { showSnackbar } from "../redux/slices/snackbarSlice";

// CSV -> array of rows. Handles commas / line breaks inside quotes, "" escapes, CRLF and a BOM.
// Returns null if a quote is never closed.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (quoted) return null;
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

// one CSV cell -> JSON value for the field type
function convert(value, type) {
  if (type === "number") {
    return isNaN(Number(value)) ? { error: "must be a number" } : { value: Number(value) };
  }
  if (type === "boolean") {
    const v = value.toLowerCase();
    if (["true", "yes", "1"].includes(v)) return { value: true };
    if (["false", "no", "0"].includes(v)) return { value: false };
    return { error: "must be true or false" };
  }
  if (type === "list") {
    return { value: value.split(/[,;|]/).map((t) => t.trim()).filter(Boolean) };
  }
  if (type === "date") {
    return isNaN(Date.parse(value)) ? { error: "must be a valid date (YYYY-MM-DD)" } : { value };
  }
  if (type === "objectId") {
    return /^[a-f\d]{24}$/i.test(value) ? { value } : { error: "must be a Product ObjectId (24 characters)" };
  }
  return { value };
}

// example cell for fields that don't give their own `sample`
const sampleByType = { number: "100", boolean: "true", list: "tag1;tag2", date: "2026-01-31", objectId: "64f1a2b3c4d5e6f708192a3b" };

// quote a CSV cell when it contains a comma, quote or line break
const csvCell = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// fields: [{ key, type?, required?, sample? }] - only these columns are sent; the first two are shown in the preview
export default function BulkUploadModal({ title, endpoint, fields, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState([]);
  const [errors, setErrors] = useState([]);
  const [ignored, setIgnored] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const readRows = (text) => {
    const table = parseCsv(text);
    if (!table || table.length < 2) {
      setErrors([table ? "The file has no data rows." : "The file is not valid CSV (a quote is never closed)."]);
      return;
    }

    const headers = table[0].map((h) => h.trim());
    const columns = headers.map((h) => fields.find((f) => f.key.toLowerCase() === h.toLowerCase()));
    setIgnored(headers.filter((h, i) => !columns[i]));
    const missing = fields.filter((f) => f.required && !columns.includes(f)).map((f) => f.key);
    if (missing.length) {
      setErrors([`Missing required column: ${missing.join(", ")}`]);
      return;
    }

    const problems = [];
    const seen = new Set();
    const rows = table.slice(1).map((cells, i) => {
      const record = {};
      columns.forEach((field, c) => {
        const value = (cells[c] || "").trim();
        if (!field || value === "") return;
        const result = convert(value, field.type);
        if (result.error) problems.push(`Row ${i + 2}: ${field.key} ${result.error}`);
        else record[field.key] = result.value;
      });
      fields.forEach((f) => {
        if (f.required && record[f.key] === undefined) problems.push(`Row ${i + 2}: ${f.key} is required`);
      });
      if (record.code) {
        if (seen.has(record.code)) problems.push(`Row ${i + 2}: code "${record.code}" is repeated in the file`);
        seen.add(record.code);
      }
      return record;
    });
    setRecords(rows);
    setErrors(problems);
  };

  const handleDownloadSample = () => {
    const header = fields.map((f) => f.key).join(",");
    const row = fields.map((f) => csvCell(f.sample ?? sampleByType[f.type] ?? "")).join(",");
    const blob = new Blob([`${header}\n${row}\n`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${endpoint.split("/")[1]}-sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setRecords([]);
    setErrors([]);
    setIgnored([]);
    const reader = new FileReader();
    reader.onload = () => readRows(String(reader.result));
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsUploading(true);
    try {
      // the body is the array itself (JSON), not FormData and not { data: [...] }
      const response = await axiosInstance.post(endpoint, records);
      dispatch(showSnackbar({ message: response?.data?.message || `${records.length} record${records.length > 1 ? "s" : ""} imported successfully`, type: "success" }));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
      setIsUploading(false);
    }
  };

  const count = records.length;

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isUploading || count === 0 || errors.length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
          >
            {isUploading ? "Importing..." : count > 0 && errors.length === 0 ? `Import ${count} Record${count > 1 ? "s" : ""}` : "Import"}
          </button>
        </>
      }
    >
      <p className="text-xs text-gray-500">
        Upload a <span className="font-medium text-gray-700">.csv</span> file with a header row. Columns: {fields.map((f) => f.key).join(", ")}.
        Required: {fields.filter((f) => f.required).map((f) => f.key).join(", ")}.
      </p>

      <button
        type="button"
        onClick={handleDownloadSample}
        className="flex items-center gap-2 mt-3 border border-gray-200 text-xs font-medium text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
      >
        <Download size={13} />
        Download Sample File
      </button>

      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full h-[72px] mt-3 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary"
      >
        <Upload size={16} />
        <span className="text-[11px] font-medium">{fileName || "Choose a .csv file"}</span>
      </button>

      {errors.length === 0 && count > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-800">
            {count} record{count > 1 ? "s" : ""} ready to import
          </p>
          <ul className="mt-1.5 text-xs text-gray-600 divide-y divide-gray-100 border border-gray-100 rounded-lg">
            {records.slice(0, 5).map((r, i) => (
              <li key={i} className="px-3 py-1.5 truncate">
                <span className="font-medium text-gray-800">{r[fields[0].key]}</span> - {r[fields[1].key]}
              </li>
            ))}
            {count > 5 && <li className="px-3 py-1.5 text-gray-400">...and {count - 5} more</li>}
          </ul>
        </div>
      )}

      {ignored.length > 0 && <p className="mt-2 text-[11px] text-gray-400">Ignored columns: {ignored.join(", ")}</p>}

      {errors.length > 0 && (
        <div className="mt-3 text-xs text-danger bg-red-50 rounded-lg px-3 py-2">
          <p className="font-medium mb-1">Fix these issues and choose the file again:</p>
          {errors.slice(0, 5).map((e, i) => (
            <p key={i}>{e}</p>
          ))}
          {errors.length > 5 && <p>...and {errors.length - 5} more</p>}
        </div>
      )}
    </Modal>
  );
}