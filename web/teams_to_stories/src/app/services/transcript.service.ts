import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { Transcript } from '../models/transcript';
import { environment } from '../../environments/environment';
import { Story } from '../models/story';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class TranscriptService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private mockDataService = inject(MockDataService);
  
  // Flag to use mock data (for demo or development)
  private useMockData = false;

  getTranscript(meetingId: string): Observable<Transcript> {
    if (this.useMockData) {
      // Return mock transcript data
      const mockTranscript: Transcript = {
        id: '123456',
        meetingId: meetingId,
        meetingTitle: 'Sprint Planning Meeting',
        dateTime: new Date().toISOString(),
        participants: [
          { id: 'user1', name: 'John Smith' },
          { id: 'user2', name: 'Jane Doe' },
          { id: 'user3', name: 'Bob Johnson' },
        ],
        segments: [
          { 
            id: 'seg1', 
            participantId: 'user1', 
            text: 'We need to prioritize the mobile authentication feature for the next sprint.',
            timestamp: '00:01:15'
          },
          { 
            id: 'seg2', 
            participantId: 'user2', 
            text: 'I agree, users have been asking for the ability to sign in with their Microsoft accounts.',
            timestamp: '00:01:42'
          },
          { 
            id: 'seg3', 
            participantId: 'user3', 
            text: 'How complex do we think this will be? We need to consider the auth flow and security implications.',
            timestamp: '00:02:10'
          }
        ]
      };
      
      return of(mockTranscript).pipe(delay(1000));
    }
    
    return this.http.get<Transcript>(`${this.apiUrl}/api/transcript/${meetingId}`)
      .pipe(
        tap(_ => console.log(`Fetched transcript for meeting id=${meetingId}`)),
        catchError(this.handleError<Transcript>('getTranscript'))
      );
  }

  processTranscript(transcript: Transcript): Observable<Story[]> {
    if (this.useMockData) {
      // Return mock generated stories
      return of(this.mockDataService.getMockStories()).pipe(delay(2000));
    }
    
    return this.http.post<Story[]>(`${this.apiUrl}/api/process-transcript`, transcript)
      .pipe(
        tap(_ => console.log('Processed transcript')),
        catchError(this.handleError<Story[]>('processTranscript', []))
      );
  }

  // For demo/development purposes - simulate uploading by meetingId
  uploadByMeetingId(meetingId: string): Observable<Story[]> {
    if (this.useMockData) {
      // First simulate getting transcript then processing it
      return of(this.mockDataService.getMockStories()).pipe(delay(3000));
    }
    
    return this.http.post<Story[]>(`${this.apiUrl}${meetingId}`, { meetingId })
      .pipe(
        tap(_ => console.log(`Uploaded transcript request for id=${meetingId}`)),
        catchError(this.handleError<Story[]>('uploadByMeetingId', []))
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