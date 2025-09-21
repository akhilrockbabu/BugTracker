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
