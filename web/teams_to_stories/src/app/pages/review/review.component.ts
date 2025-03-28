import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../services/story.service';
import { Story } from '../../models/story';
import { StoryListComponent } from '../../components/story-list/story-list.component';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  standalone: true,
  imports: [CommonModule, StoryListComponent]
})
export class ReviewComponent implements OnInit {
  private storyService = inject(StoryService);
  private router = inject(Router);
  
  statistics = {
    total: 0,
    new: 0,
    approved: 0,
    rejected: 0,
    published: 0
  };

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.storyService.getStories().subscribe(
      stories => {
        this.updateStatistics(stories);
      },
      error => {
        console.error('Error loading statistics:', error);
      }
    );
  }

  updateStatistics(stories: Story[]): void {
    this.statistics.total = stories.length;
    this.statistics.new = stories.filter(s => !s.status || s.status === 'New').length;
    this.statistics.approved = stories.filter(s => s.status === 'Approved').length;
    this.statistics.rejected = stories.filter(s => s.status === 'Rejected').length;
    this.statistics.published = stories.filter(s => s.status === 'Published').length;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}