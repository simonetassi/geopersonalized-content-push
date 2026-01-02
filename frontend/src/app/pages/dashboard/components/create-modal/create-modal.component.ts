import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface GeofenceFormData {
  name: string;
  category: string;
  color: string;
}

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.html',
})
export class CreateModalComponent {
  @Output() saved = new EventEmitter<GeofenceFormData>();
  @Output() canceled = new EventEmitter<void>();

  public formData: GeofenceFormData = {
    name: '',
    category: '',
    color: '#3b82f6',
  };

  public onSave(): void {
    if (this.formData.name.trim()) {
      this.saved.emit(this.formData);
    }
  }

  public onCancel(): void {
    this.canceled.emit();
  }
}
