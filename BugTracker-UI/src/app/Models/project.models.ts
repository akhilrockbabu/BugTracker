export interface Project
{
    projectId : number;
    projectKey : string;
    projectName : string;
}

export interface ProjectUpserDto
{
    projectKey : string;
    projectName : string;
}
