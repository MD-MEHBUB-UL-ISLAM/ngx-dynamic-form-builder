import { FormGroup } from "@angular/forms";

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'password' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'radio' 
  | 'checkbox' 
  | 'switch'
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'file'
  | 'color'
  | 'range'
  | 'group'
  | 'array';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message?: string;
  validator?: (control: any) => ValidationErrors | null;
}

export interface ValidationErrors {
  [key: string]: any;
}

export interface Option {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  required?: boolean;
  options?: Option[];
  validators?: ValidationRule[];
  asyncValidators?: ValidationRule[];
  cssClass?: string;
  cssStyle?: { [key: string]: string };
  attributes?: { [key: string]: string };
  hint?: string;
  prefix?: string;
  suffix?: string;
  rows?: number;
  cols?: number;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  accept?: string;
  fields?: FieldConfig[]; // For group type
  fieldTemplate?: string; // For array type
  visibleWhen?: (formValue: any) => boolean;
  enableWhen?: (formValue: any) => boolean;
  transform?: (value: any) => any;
  onChange?: (value: any, form: FormGroup) => void;
}

export interface FormConfig {
  fields: FieldConfig[];
  submitButton?: {
    text?: string;
    cssClass?: string;
    disabled?: boolean;
  };
  resetButton?: {
    text?: string;
    cssClass?: string;
  };
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelWidth?: string;
  validationOn?: 'change' | 'blur' | 'submit';
}