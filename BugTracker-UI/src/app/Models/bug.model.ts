export interface CreateBugRequest {
  title: string;
  description: string;
  priority: string;
  projectId: number;
  teamId: number;
  assignedTo?: number;
  UserId:number;
  labelIds: number[];
}
export interface BugResponse
{
  bugId:number;
  referenceId:string;
}

export interface Bug {
  bugId: number;
  referenceId: string;
  projectId: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy: number;
  assignedTo: number;
  teamId: number;
}