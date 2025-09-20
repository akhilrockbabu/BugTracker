using BugTracker.Api.Models;
using BugTracker.Services;
using Microsoft.AspNetCore.Mvc;


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

        // ========== TEAM CRUD ==========

        [HttpGet]
        public IActionResult GetAllTeams() => Ok(_teamService.GetAllTeams());

        [HttpGet("{id}")]
        public IActionResult GetTeamById(int id)
        {
            var team = _teamService.GetTeamById(id);
            return team == null ? NotFound() : Ok(team);
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

        // ========== TEAM MEMBERS ==========

        [HttpGet("{teamId}/members")]
        public IActionResult GetTeamMembers(int teamId)
            => Ok(_teamService.GetTeamMembers(teamId));

        [HttpPost("{teamId}/members/{userId}")]
        public IActionResult AddMember(int teamId, int userId)
        {
            _teamService.AddMember(teamId, userId);
            return Ok();
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
