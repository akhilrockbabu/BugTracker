using Microsoft.AspNetCore.Mvc;
using BugTracker.Api.Models;
using BugTracker.Api.Services.Interfaces;

namespace BugTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var projects = _projectService.GetAllProjects();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var project = _projectService.GetProjectById(id);
            if (project == null)
                return NotFound();
            return Ok(project);
        }

        [HttpPost]
        public IActionResult Create(Project project)
        {
            try
            {
                var newId = _projectService.CreateProject(project);
                return CreatedAtAction(nameof(GetById), new { id = newId }, project);
            }
            catch (Exception ex)
            {
                if (ex.InnerException?.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return Conflict(new { message = "Project with the same ProjectName or ProjectKey already exists." });
                }

                return StatusCode(500, new { message = "An error occurred while creating the project.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Project project)
        {
            if (id != project.ProjectId)
                return BadRequest();

            try
            {
                var result = _projectService.UpdateProject(project);

                if (result == 1)
                    return Conflict(new { message = "Project with the same ProjectName or ProjectKey already exists." });

                return NoContent(); // Success
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the project.", details = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _projectService.DeleteProject(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}