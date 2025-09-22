namespace BugTracker.DTOs.Bug
{
    namespace BugTracker.DTOs.Bug
    {
        public class AdminGetAllBugsDto
        {
            public int BugId { get; set; }
            public string? Title { get; set; }
            public string? Priority { get; set; }
            public string? Status { get; set; }
            public string? ProjectName { get; set; }
            public string? TeamName { get; set; }
            public string? CreatedByName { get; set; }
            public string? AssignedToName { get; set; }

        }
    }
}
