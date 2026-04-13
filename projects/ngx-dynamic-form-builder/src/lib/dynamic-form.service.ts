import { Injectable } from '@angular/core';
import { Validators, ValidatorFn, FormGroup, FormArray } from '@angular/forms';
import { FieldConfig, FormConfig } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  
  /**
   * Creates a default form configuration
   */
  createDefaultConfig(): FormConfig {
    return {
      fields: [],
      layout: 'vertical',
      validationOn: 'change',
      submitButton: {
        text: 'Submit',
        cssClass: 'btn btn-primary'
      }
    };
  }
  
  /**
   * Adds a field to the configuration
   */
  addField(config: FormConfig, field: FieldConfig): FormConfig {
    return {
      ...config,
      fields: [...config.fields, field]
    };
  }
  
  /**
   * Removes a field from configuration
   */
  removeField(config: FormConfig, fieldName: string): FormConfig {
    return {
      ...config,
      fields: config.fields.filter(f => f.name !== fieldName)
    };
  }
  
  /**
   * Updates a field in the configuration
   */
  updateField(config: FormConfig, fieldName: string, updates: Partial<FieldConfig>): FormConfig {
    return {
      ...config,
      fields: config.fields.map(f => 
        f.name === fieldName ? { ...f, ...updates } : f
      )
    };
  }
  
  /**
   * Creates a text field
   */
  createTextField(name: string, label: string, options?: Partial<FieldConfig>): FieldConfig {
    return {
      name,
      label,
      type: 'text',
      placeholder: `Enter ${label.toLowerCase()}`,
      ...options
    };
  }
  
  /**
   * Creates an email field with validation
   */
  createEmailField(name: string, label: string, options?: Partial<FieldConfig>): FieldConfig {
    return {
      name,
      label,
      type: 'email',
      placeholder: 'Enter email address',
      validators: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ],
      ...options
    };
  }
  
  /**
   * Creates a password field
   */
  createPasswordField(name: string, label: string, options?: Partial<FieldConfig>): FieldConfig {
    return {
      name,
      label,
      type: 'password',
      placeholder: 'Enter password',
      validators: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' }
      ],
      ...options
    };
  }
  
  /**
   * Creates a select field
   */
  createSelectField(
    name: string, 
    label: string, 
    options: Array<{value: any, label: string}>,
    fieldOptions?: Partial<FieldConfig>
  ): FieldConfig {
    return {
      name,
      label,
      type: 'select',
      options,
      placeholder: `Select ${label.toLowerCase()}`,
      ...fieldOptions
    };
  }
  
  /**
   * Creates a checkbox field
   */
  createCheckboxField(name: string, label: string, options?: Partial<FieldConfig>): FieldConfig {
    return {
      name,
      label,
      type: 'checkbox',
      value: false,
      ...options
    };
  }
  
  /**
   * Creates a group of fields
   */
  createFieldGroup(name: string, fields: FieldConfig[], options?: Partial<FieldConfig>): FieldConfig {
    return {
      name,
      type: 'group',
      fields,
      ...options
    };
  }
  
  /**
   * Validates a form configuration
   */
  validateConfig(config: FormConfig): string[] {
    const errors: string[] = [];
    const fieldNames = new Set<string>();
    
    config.fields.forEach(field => {
      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        errors.push(`Duplicate field name: ${field.name}`);
      }
      fieldNames.add(field.name);
      
      // Validate select fields have options
      if ((field.type === 'select' || field.type === 'radio') && !field.options?.length) {
        errors.push(`Field "${field.name}" requires options`);
      }
      
      // Validate nested groups
      if (field.type === 'group' && field.fields) {
        const nestedErrors = this.validateConfig({ fields: field.fields });
        errors.push(...nestedErrors.map(e => `${field.name}.${e}`));
      }
    });
    
    return errors;
  }
  
  /**
   * Gets all field names from configuration (including nested)
   */
  getFieldNames(config: FormConfig): string[] {
    const names: string[] = [];
    
    config.fields.forEach(field => {
      names.push(field.name);
      if (field.type === 'group' && field.fields) {
        names.push(...this.getFieldNames({ fields: field.fields }));
      }
    });
    
    return names;
  }
  
  /**
   * Finds a field by name (including nested fields)
   */
  findFieldByName(config: FormConfig, fieldName: string): FieldConfig | null {
    const parts = fieldName.split('.');
    let current = config.fields;
    
    for (let i = 0; i < parts.length; i++) {
      const field = current.find(f => f.name === parts[i]);
      if (!field) return null;
      
      if (i === parts.length - 1) {
        return field;
      }
      
      if (field.type === 'group' && field.fields) {
        current = field.fields;
      } else {
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Marks all controls in a form as touched
   */
  markAllAsTouched(form: FormGroup | FormArray): void {
    Object.values(form.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}