import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { Story } from '../models/story';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private mockDataService = inject(MockDataService);
  
  // Flag to use mock data (for demo or development)
  private useMockData = true;

  getStories(): Observable<Story[]> {
    if (this.useMockData) {
      return of(this.mockDataService.getMockStories()).pipe(
        delay(800) // Simulate network delay
      );
    }
    
    return this.http.get<Story[]>(`${this.apiUrl}/api/stories`)
      .pipe(
        tap(_ => console.log('Fetched stories')),
        catchError(this.handleError<Story[]>('getStories', []))
      );
  }

  getStory(id: string): Observable<Story> {
    if (this.useMockData) {
      const stories = this.mockDataService.getMockStories();
      const story = stories.find(s => s.id === id);
      return of(story as Story).pipe(delay(500));
    }
    
    return this.http.get<Story>(`${this.apiUrl}/api/stories/${id}`)
      .pipe(
        tap(_ => console.log(`Fetched story id=${id}`)),
        catchError(this.handleError<Story>('getStory'))
      );
  }

  updateStory(story: Story): Observable<Story> {
    if (this.useMockData) {
      return of(story).pipe(delay(700));
    }
    
    return this.http.put<Story>(`${this.apiUrl}/api/stories/${story.id}`, story)
      .pipe(
        tap(_ => console.log(`Updated story id=${story.id}`)),
        catchError(this.handleError<Story>('updateStory'))
      );
  }

  approveStory(id: string): Observable<Story> {
    if (this.useMockData) {
      const stories = this.mockDataService.getMockStories();
      const storyIndex = stories.findIndex(s => s.id === id);
      if (storyIndex !== -1) {
        const updatedStory = { ...stories[storyIndex], status: 'Approved' as const };
        return of(updatedStory).pipe(delay(600));
      }
      return of({} as Story);
    }
    
    return this.http.post<Story>(`${this.apiUrl}/api/stories/${id}/approve`, {})
      .pipe(
        tap(_ => console.log(`Approved story id=${id}`)),
        catchError(this.handleError<Story>('approveStory'))
      );
  }

  rejectStory(id: string): Observable<Story> {
    if (this.useMockData) {
      const stories = this.mockDataService.getMockStories();
      const storyIndex = stories.findIndex(s => s.id === id);
      if (storyIndex !== -1) {
        const updatedStory = { ...stories[storyIndex], status: 'Rejected' as const };
        return of(updatedStory).pipe(delay(600));
      }
      return of({} as Story);
    }
    
    return this.http.post<Story>(`${this.apiUrl}/api/stories/${id}/reject`, {})
      .pipe(
        tap(_ => console.log(`Rejected story id=${id}`)),
        catchError(this.handleError<Story>('rejectStory'))
      );
  }

  publishStory(id: string): Observable<Story> {
    if (this.useMockData) {
      const stories = this.mockDataService.getMockStories();
      const storyIndex = stories.findIndex(s => s.id === id);
      if (storyIndex !== -1) {
        const updatedStory = { 
          ...stories[storyIndex], 
          status: 'Published' as const,
          publishedId: `WI-${Math.floor(Math.random() * 1000)}`,
          publishedUrl: `https://dev.azure.com/organization/project/_workitems/edit/${Math.floor(Math.random() * 1000)}`
        };
        return of(updatedStory).pipe(delay(1000));
      }
      return of({} as Story);
    }
    
    return this.http.post<Story>(`${this.apiUrl}/api/stories/${id}/publish`, {})
      .pipe(
        tap(_ => console.log(`Published story id=${id}`)),
        catchError(this.handleError<Story>('publishStory'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}