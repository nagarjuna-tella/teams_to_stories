export interface TranscriptParticipant {
    name: string;
    id: string;
  }
  
  export interface TranscriptSegment {
    id: string;
    participantId: string;
    text: string;
    timestamp: string;
  }
  
  export interface Transcript {
    id: string;
    meetingId: string;
    meetingTitle: string;
    dateTime: string;
    participants: TranscriptParticipant[];
    segments: TranscriptSegment[];
  }