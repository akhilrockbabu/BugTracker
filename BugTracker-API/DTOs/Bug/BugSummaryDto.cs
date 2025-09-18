namespace BugTracker.Api.DTOs.Bug
{
    public class BugSummaryDto
    {
        public int TotalBugs { get; set; }
        public int OpenBugs { get; set; }
        public int InProgressBugs { get; set; }
        public int ClosedBugs { get; set; }
        public int AssignedBugs { get; set; }
    }
}
