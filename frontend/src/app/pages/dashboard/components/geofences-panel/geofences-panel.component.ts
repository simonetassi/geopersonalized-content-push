import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Geofence } from '@/common/interfaces';

@Component({
  selector: 'app-geofence-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geofences-panel.component.html',
  styleUrl: './geofences-panel.component.scss',
})
export class GeofencePanelComponent {
  @Input()
  public geofences: Geofence[] = [];
  @Input()
  public selectedId?: string;

  @Output()
  public selected = new EventEmitter<Geofence>();
  @Output()
  public created = new EventEmitter<void>();
  @Output()
  public searched = new EventEmitter<string>();

  @Input()
  public isCollapsed: boolean = false;

  public selectFence(fence: Geofence): void {
    this.selected.emit(fence);
  }

  public createNew(): void {
    this.created.emit();
  }

  public handleInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searched.emit(term);
  }

  public toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
