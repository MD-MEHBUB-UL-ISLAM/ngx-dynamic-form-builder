import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFormService } from './dynamic-form.service';


@NgModule({
  declarations: [DynamicFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    DynamicFormComponent,
    ReactiveFormsModule  // Export so consumers have access
  ]
})
export class NgxDynamicFormBuilderModule {
  static forRoot(config?: any): ModuleWithProviders<NgxDynamicFormBuilderModule> {
    return {
      ngModule: NgxDynamicFormBuilderModule,
      providers: [
        DynamicFormService,
        { provide: 'FORM_CONFIG', useValue: config }
      ]
    };
  }
  
  static forChild(): ModuleWithProviders<NgxDynamicFormBuilderModule> {
    return {
      ngModule: NgxDynamicFormBuilderModule,
      providers: []
    };
  }
}