import { Injectable } from '@angular/core';
import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  getMockStories(): Story[] {
    return [
      {
        id: '1',
        title: 'User Authentication for Mobile App',
        userStory: 'As a mobile app user, I want to be able to log in with my Microsoft account so that I can access my personalized dashboard.',
        acceptanceCriteria: [
          'User can click "Sign in with Microsoft" button on login screen',
          'User is redirected to Microsoft login page',
          'After successful authentication, user is redirected back to the app',
          'User profile information is displayed in the app header'
        ],
        storyPoints: 5,
        priority: 'High',
        tags: ['Mobile', 'Authentication', 'UI'],
        status: 'New'
      },
      {
        id: '2',
        title: 'Meeting Transcript Search',
        userStory: 'As a team member, I want to search through meeting transcripts so that I can quickly find specific discussions without watching entire recordings.',
        acceptanceCriteria: [
          'User can enter keywords in a search box',
          'Search results highlight matching text in transcripts',
          'Results are sorted by relevance',
          'Users can filter search results by date range'
        ],
        storyPoints: 8,
        priority: 'Medium',
        tags: ['Backend', 'Search', 'UI'],
        status: 'Approved'
      },
      {
        id: '3',
        title: 'Integration with Azure DevOps',
        userStory: 'As a product owner, I want approved user stories to be automatically created in Azure DevOps so that the development team can start working on them.',
        acceptanceCriteria: [
          'Approved stories are pushed to Azure DevOps within 5 minutes',
          'Story details including acceptance criteria are preserved',
          'A link to the original transcript is included in the DevOps work item',
          'Story status is updated to "Published" after successful creation in DevOps'
        ],
        storyPoints: 5,
        priority: 'High',
        tags: ['Integration', 'API', 'DevOps'],
        status: 'Published',
        publishedId: 'WI-234',
        publishedUrl: 'https://dev.azure.com/organization/project/_workitems/edit/234'
      },
      {
        id: '4',
        title: 'Dashboard Analytics',
        userStory: 'As a manager, I want to see analytics on story generation and processing so that I can measure the efficiency of our planning process.',
        acceptanceCriteria: [
          'Dashboard shows number of stories generated per meeting',
          'Dashboard displays average time from transcript to approved story',
          'Visual chart shows story point distribution',
          'Data can be filtered by time period and team'
        ],
        storyPoints: 3,
        priority: 'Low',
        tags: ['Dashboard', 'Analytics', 'UI'],
        status: 'Rejected'
      },
      {
        id: '5',
        title: 'AI Accuracy Improvement',
        userStory: 'As a product owner, I want to provide feedback on AI-generated stories so that the system can improve its accuracy over time.',
        acceptanceCriteria: [
          'Each generated story has thumbs up/down feedback buttons',
          'User can provide text comments on rejected stories',
          'System tracks feedback metrics over time',
          'AI model is retrained monthly with feedback data'
        ],
        storyPoints: 8,
        priority: 'Medium',
        tags: ['AI', 'ML', 'Feedback'],
        status: 'New'
      }
    ];
  }
}