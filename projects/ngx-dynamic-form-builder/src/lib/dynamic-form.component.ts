import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  TemplateRef,
  AfterContentInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  FormArray,
  FormControl,
  AsyncValidatorFn,
  ValidatorFn,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FieldConfig, FormConfig, ValidationRule } from './interfaces';

@Component({
  selector: 'df-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DynamicFormComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input() config!: FormConfig;
  @Input() initialData: any = {};
  @Input() disabled = false;
  @Input() readonly = false;
  
  @Output() formReady = new EventEmitter<FormGroup>();
  @Output() valueChanges = new EventEmitter<any>();
  @Output() statusChanges = new EventEmitter<string>();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();
  
  @ContentChildren('fieldTemplate') fieldTemplates!: QueryList<TemplateRef<any>>;
  
  form!: FormGroup;
  fieldTemplatesMap = new Map<string, TemplateRef<any>>();
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.setupFormListeners();
    this.applyInitialData();
    this.formReady.emit(this.form);
  }

  ngAfterContentInit(): void {
    this.registerFieldTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Add missing methods
  getFormClasses(): string {
    const classes = ['dynamic-form'];
    if (this.config.layout) {
      classes.push(`form-layout-${this.config.layout}`);
    }
    return classes.join(' ');
  }

  getFieldClasses(field: FieldConfig): string {
    const classes = ['form-field', `field-type-${field.type}`];
    if (field.cssClass) {
      classes.push(field.cssClass);
    }
    if (this.isFieldInvalid(field.name)) {
      classes.push('field-invalid');
    }
    if (this.isFieldValid(field.name)) {
      classes.push('field-valid');
    }
    return classes.join(' ');
  }

  private buildForm(): void {
    const controls: { [key: string]: any } = {};
    
    this.config.fields.forEach(field => {
      if (!field.hidden) {
        controls[field.name] = this.createControl(field);
      }
    });
    
    this.form = this.fb.group(controls);
    
    // Apply conditional logic
    this.applyConditionalLogic();
  }

  private createControl(field: FieldConfig): any {
    const value = field.value !== undefined ? field.value : this.getDefaultValue(field);
    const validators = this.buildValidators(field.validators || []);
    const asyncValidators = this.buildAsyncValidators(field.asyncValidators || []);
    
    if (field.type === 'array') {
      return this.fb.array([]);
    } else if (field.type === 'group') {
      return this.createGroup(field.fields || []);
    } else {
      return [value, validators, asyncValidators];
    }
  }

  private createGroup(fields: FieldConfig[]): FormGroup {
    const group: { [key: string]: any } = {};
    
    fields.forEach(field => {
      group[field.name] = this.createControl(field);
    });
    
    return this.fb.group(group);
  }

  private buildValidators(rules: ValidationRule[]): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    rules.forEach(rule => {
      switch (rule.type) {
        case 'required':
          validators.push(Validators.required);
          break;
        case 'email':
          validators.push(Validators.email);
          break;
        case 'minLength':
          validators.push(Validators.minLength(rule.value));
          break;
        case 'maxLength':
          validators.push(Validators.maxLength(rule.value));
          break;
        case 'pattern':
          validators.push(Validators.pattern(rule.value));
          break;
        case 'custom':
          if (rule.validator) {
            validators.push(rule.validator);
          }
          break;
      }
    });
    
    return validators;
  }

  private buildAsyncValidators(rules: ValidationRule[]): AsyncValidatorFn[] {
    return [];
  }

  private getDefaultValue(field: FieldConfig): any {
    switch (field.type) {
      case 'checkbox':
      case 'switch':
        return false;
      case 'multiselect':
        return [];
      case 'number':
      case 'range':
        return field.value ?? 0;
      default:
        return field.value ?? '';
    }
  }

  private setupFormListeners(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.valueChanges.emit(value);
        this.applyConditionalLogic();
      });
      
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.statusChanges.emit(status);
      });
  }

  private applyConditionalLogic(): void {
    const formValue = this.form.getRawValue();
    
    this.config.fields.forEach(field => {
      const control = this.form.get(field.name);
      
      if (field.visibleWhen) {
        const visible = field.visibleWhen(formValue);
        field.hidden = !visible;
        this.updateControlVisibility(field.name, visible);
      }
      
      if (field.enableWhen && control) {
        const enabled = field.enableWhen(formValue);
        enabled ? control.enable() : control.disable();
      }
    });
    
    this.cdr.detectChanges();
  }

  private updateControlVisibility(fieldName: string, visible: boolean): void {
    const control = this.form.get(fieldName);
    
    if (visible && !control) {
      const field = this.config.fields.find(f => f.name === fieldName);
      if (field) {
        this.form.addControl(fieldName, this.createControl(field) as AbstractControl);
      }
    } else if (!visible && control) {
      this.form.removeControl(fieldName);
    }
  }

  private applyInitialData(): void {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  private registerFieldTemplates(): void {
    this.fieldTemplates.forEach(template => {
      const name = (template as any)._declarationTContainer?.localNames?.[0];
      if (name) {
        this.fieldTemplatesMap.set(name, template);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control && control.errors && control.touched) {
      const firstError = Object.keys(control.errors)[0];
      const field = this.config.fields.find(f => f.name === fieldName);
      const rule = field?.validators?.find(v => v.type === firstError);
      
      return rule?.message || `${fieldName} is invalid`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.valid && control.touched);
  }

  getFormArray(fieldName: string): FormArray {
    return this.form.get(fieldName) as FormArray;
  }

  addArrayItem(fieldName: string, itemData?: any): void {
    const array = this.getFormArray(fieldName);
    const field = this.config.fields.find(f => f.name === fieldName);
    
    if (field?.fields) {
      array.push(this.createGroup(field.fields));
    } else {
      array.push(this.fb.control(itemData || ''));
    }
  }

  removeArrayItem(fieldName: string, index: number): void {
    const array = this.getFormArray(fieldName);
    array.removeAt(index);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  onReset(): void {
    this.form.reset(this.initialData);
    this.formReset.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldTemplate(fieldName: string): TemplateRef<any> | null {
    return this.fieldTemplatesMap.get(fieldName) || null;
  }
}