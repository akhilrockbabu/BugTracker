import { HttpClient } from '@angular/common/http';
import { Injectable, OptionalDecorator } from '@angular/core';
import { Observable } from 'rxjs';
import { Label } from '../Models/label.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private baseUrl = 'https://localhost:7062/api/labels'; // Adjust API endpoint as needed
 labels:Label[]=[];
  constructor(private http: HttpClient) {
    this.http.get<Label[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.labels = data;
        console.log('Labels loaded:', this.labels);
      },
      error: (err) => {
        console.error('Error fetching Labels:', err);
      }
    });
  }
 

  getAllLabels(): Label[] {
    return this.labels;
  }

  assignLabelsToBug(bugId: number, labelIds: number[]): Observable<any> {
    // Adjust endpoint and payload to match backend API
    return this.http.post(`/api/bugs/${bugId}/labels`, { labelIds });
  }
}
