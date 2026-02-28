import React from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  name,
  required = false
}) => {
  const inputClassName = `input-field${error ? ' input-field-error' : ''}${disabled ? ' input-field-disabled' : ''}`;

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="input-required"> *</span>}
        </label>
      )}

      <input
        id={name}
        className={inputClassName}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        required={required}
      />

      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
};

export default Input;
