import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Story } from '../../models/story';

@Component({
  selector: 'app-story-edit',
  templateUrl: './story-edit.component.html',
  styleUrls: ['./story-edit.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogModule]
})
export class StoryEditComponent implements OnInit {
  storyForm: FormGroup;
  
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<StoryEditComponent>);
  public data: {story: Story} = inject(MAT_DIALOG_DATA);
  
  priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];
  
  storyPointOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 8, label: '8' }
  ];

  constructor() {
    this.storyForm = this.fb.group({
      title: ['', [Validators.required]],
      userStory: ['', [Validators.required]],
      acceptanceCriteria: ['', [Validators.required]],
      storyPoints: [3, [Validators.required]],
      priority: ['Medium', [Validators.required]],
      tags: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.story) {
      this.storyForm.patchValue({
        title: this.data.story.title,
        userStory: this.data.story.userStory,
        acceptanceCriteria: this.data.story.acceptanceCriteria.join('\n'),
        storyPoints: this.data.story.storyPoints,
        priority: this.data.story.priority,
        tags: this.data.story.tags.join(', ')
      });
    }
  }

  onSubmit(): void {
    if (this.storyForm.invalid) {
      return;
    }

    const formValue = this.storyForm.value;
    
    const updatedStory: Story = {
      ...this.data.story,
      title: formValue.title,
      userStory: formValue.userStory,
      acceptanceCriteria: formValue.acceptanceCriteria.split('\n').filter((item: string) => item.trim() !== ''),
      storyPoints: formValue.storyPoints,
      priority: formValue.priority,
      tags: formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '')
    };

    this.dialogRef.close(updatedStory);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}