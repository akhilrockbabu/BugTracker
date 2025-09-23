using BugTracker.Api.Models;
using BugTracker.Api.Repositories.Interfaces;
using BugTracker.Api.Services.Interfaces;
using BugTracker.DTOs;
using BugTracker.DTOs.Bug;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.Data;

namespace BugTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BugController : ControllerBase
    {
        private readonly IBugService _bugService;
        private readonly IBugRepository _bugRespository;

        public BugController(IBugService bugService,IConfiguration iconfiguration,IBugRepository bugRepository)
        {
            _bugService = bugService;
            _bugRespository = bugRepository;
        }

        // ✅ Get all bugs (with optional filters & pagination)
        [HttpGet]
        public async Task<IActionResult> GetBugs([FromQuery] string? status, [FromQuery] int? assignedTo, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] int? TeamId=null)
        {
            var bugs = await _bugService.GetBugsAsync(status, assignedTo, page, pageSize,TeamId);
            return Ok(bugs);
        }

        // ✅ Get a single bug by ID (with comments & labels if you extend service)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBug(int id)
        {
            var bug = await _bugService.GetBugByIdAsync(id);
            if (bug == null) return NotFound();
            return Ok(bug);
        }

        // ✅ Add a new bug
        [HttpPost]
        public async Task<IActionResult> AddBug([FromBody] AddBugDto bugDto)
        {
            // Assume you get the current user's ID from JWT / HttpContext
            int createdByUserId = bugDto.UserId;

            var bug = new Bug
            {
                Title = bugDto.Title,
                Description = bugDto.Description,
                ProjectId = bugDto.ProjectId,
                AssignedTo = bugDto.AssignedTo,
                Status = bugDto.Status ?? "Open",
                Priority = bugDto.Priority ?? "Medium",   // default if null
                CreatedBy = createdByUserId,
                ReferenceId = null, // create a unique ref
                TeamId = bugDto.TeamId
            };
            Console.WriteLine(bug.TeamId);
            int bugId = await _bugService.AddBugAsync(bug);

            return Ok(new { bugId, bug.ReferenceId });
        }
        // ✅ Update bug details
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBug(int id, [FromBody] UpdateBugDto bugDto)
        {
            if (id != bugDto.BugId)
                return BadRequest("BugId mismatch.");

            var bug = await _bugService.GetBugByIdAsync(id);
            if (bug == null) return NotFound();

            // Only update the fields that are provided
            bug.Title = bugDto.Title ?? bug.Title;
            bug.Description = bugDto.Description ?? bug.Description;
            bug.Priority = bugDto.Priority ?? bug.Priority;
            bug.Status = bugDto.Status ?? bug.Status;
            bug.AssignedTo = bugDto.AssignedTo ?? bug.AssignedTo;
            bug.TeamId = bugDto.AssignedTo ?? bug.TeamId;
            await _bugService.UpdateBugAsync(bug);

            return Ok(bug);
        }


        // ✅ Update bug status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateBugStatus(int id, [FromQuery] string status, [FromQuery] int actingUserId)
        {
            try
            {
                var result = await _bugService.UpdateBugStatusAsync(id, status, actingUserId);
                if (!result) return NotFound();
                return Ok("Bug status updated successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ✅ Assign bug to a user
        [HttpPatch("{id}/assign/{userId}")]
        public async Task<IActionResult> AssignBug(int id, int userId)
        {
            var result = await _bugService.AssignBugAsync(id, userId);
            if (!result) return NotFound();

            return Ok("Bug assigned successfully");
        }

        // ✅ Search bugs by keyword
        [HttpGet("search")]
        public async Task<IActionResult> SearchBugs([FromQuery] string keyword)
        {
            var bugs = await _bugService.SearchBugsAsync(keyword);
            return Ok(bugs);
        }

        // ✅ Bug summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetBugSummary([FromQuery] int? TeamId=null)
        {
            var summary = await _bugService.GetBugSummaryAsync(TeamId);
            return Ok(summary);
        }

        [HttpGet("GetAllBugs")]
        public async Task<IActionResult> GetAllBugs()
        {
            var bugs = await _bugService.GetAllBugsAsync();
            return Ok(bugs);
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<Bug>>> GetBugsByProject(int projectId)
        {
            var bugs = await _bugRespository.GetBugsByProjectIdAsync(projectId);

            if (!bugs.Any())
                return NotFound($"No bugs found for ProjectId {projectId}");

            return Ok(bugs);
        }


    }
}
