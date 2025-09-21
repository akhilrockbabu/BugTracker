using BugTracker.DTOs;
using BugTracker.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace BugTracker.Repositories
{
    public class AdminDashboardRepository : IAdminDashboardRepository
    {
        private readonly string _connectionString;

        public AdminDashboardRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<AdminSummaryDto> GetAdminSummaryAsync()
        {
            var summary = new AdminSummaryDto();
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var cmdProjects = new SqlCommand("SELECT COUNT(*) FROM Projects", connection))
                {
                    summary.TotalProjects = (int)(await cmdProjects.ExecuteScalarAsync() ?? 0);
                }
                using (var cmdTeams = new SqlCommand("SELECT COUNT(*) FROM Teams", connection))
                {
                    summary.TotalTeams = (int)(await cmdTeams.ExecuteScalarAsync() ?? 0);
                }
                using (var cmdUsers = new SqlCommand("SELECT COUNT(*) FROM Users", connection))
                {
                    summary.TotalUsers = (int)(await cmdUsers.ExecuteScalarAsync() ?? 0);
                }
                using (var cmdBugs = new SqlCommand("SELECT COUNT(*) FROM Bugs", connection))
                {
                    summary.TotalBugs = (int)(await cmdBugs.ExecuteScalarAsync() ?? 0);
                }
                using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Bugs WHERE Status = 'Open'", connection))
                {
                    summary.TotalOpenBugs = (int)(await cmd.ExecuteScalarAsync() ?? 0);
                }

                using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Bugs WHERE Status = 'In Progress'", connection))
                {
                    summary.TotalInProgressBugs = (int)(await cmd.ExecuteScalarAsync() ?? 0);
                }

                // Get total number of unassigned teams (ProjectId is 0 or NULL)
                using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Teams WHERE ProjectId = 0 OR ProjectId IS NULL", connection))
                {
                    summary.TotalUnassignedTeams = (int)(await cmd.ExecuteScalarAsync() ?? 0);
                }

                // Get total number of users not assigned to any team.
                // This query finds all users that do not have an entry in the TeamMembers table.
                string unassignedUsersSql = @"
                    SELECT COUNT(u.UserId) 
                    FROM Users u
                    LEFT JOIN TeamMembers tm ON u.UserId = tm.UserId
                    WHERE tm.TeamId IS NULL;";
                using (var cmd = new SqlCommand(unassignedUsersSql, connection))
                    summary.TotalUnassignedUsers = (int)(await cmd.ExecuteScalarAsync() ?? 0);
            }
            return summary;
        }

    }
}
