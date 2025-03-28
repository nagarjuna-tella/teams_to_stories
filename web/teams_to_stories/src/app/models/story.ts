export interface Story {
    id?: string;
    title: string;
    userStory: string;
    acceptanceCriteria: string[];
    storyPoints: number;
    priority: 'High' | 'Medium' | 'Low';
    tags: string[];
    status?: 'New' | 'Approved' | 'Rejected' | 'Published';
    publishedId?: string;
    publishedUrl?: string;
  }