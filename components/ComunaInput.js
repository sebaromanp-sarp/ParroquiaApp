"use client";

import { NOMBRES_COMUNAS } from "../lib/comunas";

let listIdCounter = 0;

export default function ComunaInput({ id, value, onChange, placeholder, hasError }) {
  const listId = id || `comunas-list-${++listIdCounter}`;

  return (
    <>
      <input
        list={listId}
        type="text"
        value={value}
        autoComplete="off"
        placeholder={placeholder || "Seleccione una comuna..."}
        className={hasError ? "error" : ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {NOMBRES_COMUNAS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
