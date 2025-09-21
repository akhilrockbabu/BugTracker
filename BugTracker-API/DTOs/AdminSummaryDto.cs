namespace BugTracker.DTOs
{
    public class AdminSummaryDto
    {
        public int TotalProjects { get; set; }
        public int TotalTeams { get; set; }
        public int TotalUsers { get; set; }
        public int TotalBugs { get; set; }
        public int TotalOpenBugs { get; set; }
        public int TotalInProgressBugs { get; set; }
        public int TotalUnassignedTeams { get; set; }
        public int TotalUnassignedUsers { get; set; }
    }
}
