import showOpenDialog from "./showOpenDialog";

export function Checkbox({ label: _label, title, checked, onChange }) {
  return (
    <label title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
      />{" "}
      {_label}
    </label>
  );
}

export function Select({ label: _label, title, values, selected, onChange }) {
  return (
    <label title={title}>
      {_label}{" "}
      <select value={selected} onChange={(ev) => onChange(ev.target.value)}>
        {values.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberInput({
  label: _label,
  title,
  value,
  min,
  max,
  step,
  onChange,
}) {
  return (
    <label title={title}>
      {_label}{" "}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(Number.parseInt(ev.target.value, 10))}
      />
    </label>
  );
}

export function Input({ label: _label, title, value, onChange }) {
  return (
    <label title={title}>
      {_label}{" "}
      <input value={value} onChange={(ev) => onChange(ev.target.value)} />
    </label>
  );
}

export function FileInput({ label: _label, title, value, onChange }) {
  return (
    <label title={title}>
      {_label}{" "}
      <button
        onClick={async () => {
          const value = await showOpenDialog();
          onChange(value);
        }}
      >
        Select File
      </button>
      <input
        value={value}
        onChange={(ev) => {
          onChange(ev.target.value);
        }}
      />
    </label>
  );
}

export function FolderInput({ label: _label, title, value, onChange }) {
  return (
    <label title={title}>
      {_label}{" "}
      <button
        onClick={async () => {
          const value = await showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
          });
          onChange(value);
        }}
      >
        Select Folder
      </button>
      <input
        value={value}
        onChange={(ev) => {
          onChange(ev.target.value);
        }}
      />
    </label>
  );
}
