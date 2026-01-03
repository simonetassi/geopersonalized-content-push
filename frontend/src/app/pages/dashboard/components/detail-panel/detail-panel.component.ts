import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Geofence } from '@/common/interfaces';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-panel.component.html',
})
export class DetailPanelComponent implements OnChanges {
  @Input() fence?: Geofence;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Geofence>();
  @Output() deleted = new EventEmitter<string>();
  @Output() mapEditToggled = new EventEmitter<boolean>();

  public editData?: Geofence;
  public isEditing: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fence'] && this.fence) {
      this.cancelEdit();
    }
  }

  public startEdit(): void {
    this.isEditing = true;
    this.mapEditToggled.emit(true);
  }

  public cancelEdit(): void {
    this.isEditing = false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.editData = JSON.parse(JSON.stringify(this.fence));
    this.mapEditToggled.emit(false);
  }

  public onSave(): void {
    if (this.editData) {
      this.saved.emit(this.editData);
      this.isEditing = false;
      this.mapEditToggled.emit(false);
    }
  }

  public onDelete(): void {
    if (this.fence) {
      this.deleted.emit(this.fence.id);
    }
  }
}
