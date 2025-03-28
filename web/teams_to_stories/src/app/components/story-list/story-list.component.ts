import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Story } from '../../models/story';
import { StoryService } from '../../services/story.service';
import { Router } from '@angular/router';
import { StoryCardComponent } from '../story-card/story-card.component';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss'],
  standalone: true,
  imports: [CommonModule, StoryCardComponent]
})
export class StoryListComponent implements OnInit {
  private storyService = inject(StoryService);
  private router = inject(Router);
  
  stories: Story[] = [];
  filteredStories: Story[] = [];
  loading = true;
  error = '';
  
  activeFilter: 'all' | 'new' | 'approved' | 'rejected' | 'published' = 'all';
  
  ngOnInit(): void {
    this.loadStories();
  }

  loadStories(): void {
    this.loading = true;
    this.storyService.getStories()
      .subscribe(
        stories => {
          this.stories = stories;
          this.applyFilter(this.activeFilter);
          this.loading = false;
        },
        error => {
          this.error = 'Error loading stories. Please try again.';
          this.loading = false;
        }
      );
  }

  applyFilter(filter: 'all' | 'new' | 'approved' | 'rejected' | 'published'): void {
    this.activeFilter = filter;
    
    if (filter === 'all') {
      this.filteredStories = this.stories;
    } else {
      this.filteredStories = this.stories.filter(story => {
        if (filter === 'new') return !story.status || story.status === 'New';
        return story.status === this.capitalizeFirstLetter(filter);
      });
    }
  }

  // Helper method to capitalize first letter
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onApprove(id: string): void {
    this.storyService.approveStory(id)
      .subscribe(
        updatedStory => {
          const index = this.stories.findIndex(s => s.id === id);
          if (index !== -1) {
            this.stories[index] = updatedStory;
            this.applyFilter(this.activeFilter);
          }
        },
        error => {
          console.error('Error approving story:', error);
        }
      );
  }

  onReject(id: string): void {
    this.storyService.rejectStory(id)
      .subscribe(
        updatedStory => {
          const index = this.stories.findIndex(s => s.id === id);
          if (index !== -1) {
            this.stories[index] = updatedStory;
            this.applyFilter(this.activeFilter);
          }
        },
        error => {
          console.error('Error rejecting story:', error);
        }
      );
  }

  onEdit(story: Story): void {
    // Navigate to edit page or open edit modal
    console.log('Edit story:', story);
    // Implementation depends on your UI design
  }

  onPublish(id: string): void {
    this.storyService.publishStory(id)
      .subscribe(
        updatedStory => {
          const index = this.stories.findIndex(s => s.id === id);
          if (index !== -1) {
            this.stories[index] = updatedStory;
            this.applyFilter(this.activeFilter);
          }
        },
        error => {
          console.error('Error publishing story:', error);
        }
      );
  }
}