import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Add this import
import { NgxDynamicFormBuilderModule, FormConfig, DynamicFormService } from 'ngx-dynamic-form-builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,  // Add CommonModule for *ngIf and json pipe
    NgxDynamicFormBuilderModule
  ],
  template: `
    <div class="demo-container">
      <h1>🚀 Dynamic Form Builder Demo</h1>
      
      <div class="form-section">
        <h2>Registration Form</h2>
        <df-dynamic-form
          [config]="formConfig"
          (formReady)="onFormReady($event)"
          (formSubmit)="onSubmit($event)"
          (valueChanges)="onValueChange($event)">
        </df-dynamic-form>
      </div>
      
      <div class="output-section" *ngIf="formData">
        <h3>Form Data:</h3>
        <pre>{{ formData | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #333;
      margin-bottom: 2rem;
    }
    
    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .output-section {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    pre {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class App implements OnInit {  // Changed from 'App' to 'AppComponent'
  formConfig!: FormConfig;
  form!: FormGroup;
  formData: any = null;
  
  constructor(private formService: DynamicFormService) {}
  
  ngOnInit(): void {
    this.buildFormConfig();
  }
  
  buildFormConfig(): void {
    this.formConfig = {
      fields: [
        this.formService.createTextField('fullName', 'Full Name', {
          placeholder: 'John Doe',
          required: true,
          validators: [
            { type: 'required', message: 'Full name is required' },
            { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' }
          ]
        }),
        
        this.formService.createEmailField('email', 'Email Address'),
        
        this.formService.createPasswordField('password', 'Password'),
        
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          placeholder: 'Confirm your password',
          validators: [
            { type: 'required', message: 'Please confirm your password' },
            {
              type: 'custom',
              message: 'Passwords do not match',
              validator: (control: any) => {
                if (this.form) {
                  const password = this.form.get('password')?.value;
                  return password === control.value ? null : { passwordMismatch: true };
                }
                return null;
              }
            }
          ]
        },
        
        this.formService.createSelectField('country', 'Country', [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' }
        ], { placeholder: 'Select your country' }),
        
        {
          name: 'interests',
          label: 'Interests',
          type: 'multiselect',
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
            { value: 'music', label: 'Music' },
            { value: 'travel', label: 'Travel' }
          ],
          multiple: true
        },
        
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
          placeholder: 'Tell us about yourself',
          rows: 4,
          hint: 'Maximum 500 characters'
        },
        
        {
          name: 'newsletter',
          label: 'Subscribe to newsletter',
          type: 'checkbox',
          value: true
        },
        
        {
          name: 'experience',
          label: 'Experience Level',
          type: 'radio',
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'expert', label: 'Expert' }
          ]
        },
        
        {
          name: 'preferredContact',
          label: 'Preferred Contact Method',
          type: 'select',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'sms', label: 'SMS' }
          ],
          visibleWhen: (formValue: any) => {
            return formValue.newsletter === true;
          }
        },
        
        {
          name: 'satisfaction',
          label: 'Satisfaction',
          type: 'range',
          min: 0,
          max: 10,
          step: 1,
          value: 8
        }
      ],
      
      layout: 'vertical',
      validationOn: 'change',
      
      submitButton: {
        text: 'Register',
        cssClass: 'btn btn-primary'
      },
      
      resetButton: {
        text: 'Clear Form',
        cssClass: 'btn btn-secondary'
      }
    };
  }
  
  onFormReady(form: FormGroup): void {
    this.form = form;
    console.log('Form ready!', form);
  }
  
  onValueChange(value: any): void {
    console.log('Form value changed:', value);
  }
  
  onSubmit(data: any): void {
    this.formData = data;
    console.log('Form submitted!', data);
    alert('Form submitted successfully! Check console for data.');
  }
}