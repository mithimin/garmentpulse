// apps/web/components/Field.tsx
//
// A text box or a dropdown with a label ABOVE it and an error message right
// UNDER it (design system section 9.4). Every input must have a visible label.
// `Field` wraps the label and message; `TextInput` and `SelectInput` are the boxes.
// Owned by Mithi.

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  error?: string;
  /** Receives the id to put on the box, so the label is joined to it. */
  children: (id: string) => ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="input" {...props} />;
}
