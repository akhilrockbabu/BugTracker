namespace BugTracker.DTOs.Bug
{
    public class UpdateBugDto
    {
        public int BugId { get; set; } // required to know which bug to update

        public string? Title { get; set; }         // optional, can be null if not updating
        public string? Description { get; set; }   // optional
        public string? Priority { get; set; }      // optional
        public string? Status { get; set; }        // optional
        public int? AssignedTo { get; set; }       // optional
    }

}
