import { Component, input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Story } from '../../models/story';

@Component({
  selector: 'app-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StoryCardComponent {
  story = input.required<Story>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Story>();
  @Output() publish = new EventEmitter<string>();
  
  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  onApprove() {
    this.approve.emit(this.story().id);
  }

  onReject() {
    this.reject.emit(this.story().id);
  }

  onEdit() {
    this.edit.emit(this.story());
  }

  onPublish() {
    this.publish.emit(this.story().id);
  }

  getPriorityClass(): string {
    switch (this.story().priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(): string {
    switch (this.story().status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Published':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}