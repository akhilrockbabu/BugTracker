namespace BugTracker.DTOs.Bug
{
    public class AddBugDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int ProjectId { get; set; }
        public int? AssignedTo { get; set; }
        public string Status { get; set; } = "Open";

        // default status
        public string Priority { get; set; } = "Medium";
        public int UserId { get; set; }

        public int? TeamId { get; set; }
                                                     // No BugId, no ReferenceId here
    }

}
