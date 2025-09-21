using BugTracker.Api.Models;
using BugTracker.Services;
using Microsoft.AspNetCore.Mvc;
using static BugTracker.Api.Repositories.TeamRepository;

namespace BugTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamController : ControllerBase
    {
        private readonly TeamService _teamService;

        public TeamController(TeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet]
        public IActionResult GetAllTeams()
        {
            var teams = _teamService.GetAllTeams();

            var response = teams.Select(team => new
            {
                team.TeamId,
                team.TeamName,
                team.ProjectId,
                MembersCount = _teamService.GetTeamMembers(team.TeamId).Count()
            });

            return Ok(response);
        }

        [HttpGet("{id}")]
        public IActionResult GetTeamById(int id)
        {
            var team = _teamService.GetTeamById(id);
            if (team == null) return NotFound();

            var response = new
            {
                team.TeamId,
                team.TeamName,
                team.ProjectId,
                MembersCount = _teamService.GetTeamMembers(team.TeamId).Count(),
                Members = _teamService.GetTeamMembers(team.TeamId)
            };

            return Ok(response);
        }

        [HttpPost]
        public IActionResult CreateTeam([FromBody] Team team)
        {
            var newId = _teamService.CreateTeam(team);
            return CreatedAtAction(nameof(GetTeamById), new { id = newId }, newId);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateTeam(int id, [FromBody] Team team)
        {
            team.TeamId = id;
            _teamService.UpdateTeam(team);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTeam(int id)
        {
            _teamService.DeleteTeam(id);
            return NoContent();
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetTeamsByUser(int userId)
            => Ok(_teamService.GetTeamsByUser(userId));

        [HttpGet("{teamId}/members")]
        public IActionResult GetTeamMembers(int teamId)
            => Ok(_teamService.GetTeamMembers(teamId));

        [HttpPost("{teamId}/members/{userId}")]
        public IActionResult AddMember(int teamId, int userId)
        {
            var result = _teamService.AddMember(teamId, userId);

            if (result == AddMemberResult.AlreadyInThisTeam)
            {
                return BadRequest(new { message = $"Employee {userId} is already a member of this team." });
            }

            return Ok(new { message = $"Employee {userId} added to team {teamId} successfully." });
        }

        [HttpDelete("{teamId}/members/{userId}")]
        public IActionResult RemoveMember(int teamId, int userId)
        {
            _teamService.RemoveMember(teamId, userId);
            return NoContent();
        }

        [HttpDelete("{teamId}/members")]
        public IActionResult RemoveAllMembers(int teamId)
        {
            _teamService.RemoveAllMembers(teamId);
            return NoContent();
        }

    }
}
