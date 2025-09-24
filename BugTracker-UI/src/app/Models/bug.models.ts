export interface Bug {
  bugId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: number | null;
  teamId: number | null;
  createdBy: number;
  createdAt?: Date;
  projectId: number |null;
 
}
 