using BugTracker.Api.Models;
using System.Data.SqlClient;
using Microsoft.Data.SqlClient;
using System.Data;

namespace BugTracker.Api.Repositories
{
    public class TeamRepository
    {
        private readonly string _connectionString;
        public TeamRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        // ========== TEAM CRUD ==========

        public List<Team> GetAllTeams()
        {
            var teams = new List<Team>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT TeamId, TeamName, ProjectId FROM Teams", conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                teams.Add(new Team
                {
                    TeamId = (int)reader["TeamId"],
                    TeamName = reader["TeamName"].ToString(),
                    ProjectId = reader["ProjectId"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["ProjectId"])
                });
            }
            return teams;
        }

        public Team GetTeamById(int teamId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT TeamId, TeamName, ProjectId FROM Teams WHERE TeamId=@id", conn);
            cmd.Parameters.AddWithValue("@id", teamId);
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Team
                {
                    TeamId = (int)reader["TeamId"],
                    TeamName = reader["TeamName"].ToString(),
                    ProjectId = reader["ProjectId"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["ProjectId"])
                };
            }
            return null;
        }

        public int CreateTeam(Team team)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            string sql = @"INSERT INTO Teams (TeamName, ProjectId)
                           VALUES (@name, @projectId);
                           SELECT SCOPE_IDENTITY();";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@name", team.TeamName);
            if (team.ProjectId.HasValue)
                cmd.Parameters.AddWithValue("@projectId", team.ProjectId.Value);
            else
                cmd.Parameters.AddWithValue("@projectId", DBNull.Value);
            return Convert.ToInt32(cmd.ExecuteScalar());
        }

        public void UpdateTeam(Team team)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            string sql = @"UPDATE Teams SET TeamName=@name, ProjectId=@projectId
                           WHERE TeamId=@id";
            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@name", team.TeamName);
            cmd.Parameters.AddWithValue("@projectId", team.ProjectId);
            cmd.Parameters.AddWithValue("@id", team.TeamId);
            cmd.ExecuteNonQuery();
        }

        public void DeleteTeam(int teamId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();

            // delete members first
            using (var cmd1 = new SqlCommand("DELETE FROM TeamMembers WHERE TeamId=@id", conn))
            {
                cmd1.Parameters.AddWithValue("@id", teamId);
                cmd1.ExecuteNonQuery();
            }
            // delete team
            using (var cmd2 = new SqlCommand("DELETE FROM Teams WHERE TeamId=@id", conn))
            {
                cmd2.Parameters.AddWithValue("@id", teamId);
                cmd2.ExecuteNonQuery();
            }
        }

        public List<Team> GetTeamsByUser(int userId)
        {
            var teams = new List<Team>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            string sql = @"
                SELECT t.TeamId, t.TeamName, t.ProjectId
                FROM Teams t
                INNER JOIN TeamMembers tm ON t.TeamId = tm.TeamId
                WHERE tm.UserId = @userId";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@userId", userId);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                teams.Add(new Team
                {
                    TeamId = (int)reader["TeamId"],
                    TeamName = reader["TeamName"].ToString(),
                    ProjectId = reader["ProjectId"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["ProjectId"])
                });
            }
            return teams;
        }

        // ========== TEAM MEMBERS ==========

        public List<int> GetTeamMemberIds(int teamId)
        {
            var memberIds = new List<int>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("SELECT UserId FROM TeamMembers WHERE TeamId = @teamId", conn);
            cmd.Parameters.AddWithValue("@teamId", teamId);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                memberIds.Add((int)reader["UserId"]);
            }
            return memberIds;
        }

        public enum AddMemberResult
        {
            Success,
            AlreadyInThisTeam,
            AlreadyInTwoTeams
        }

        public AddMemberResult AddMember(int teamId, int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            // Add inside AddMember method, before inserting
            using (var checkUserCmd = new SqlCommand(
                "SELECT COUNT(*) FROM Users WHERE UserId=@uid", conn))
            {
                checkUserCmd.Parameters.AddWithValue("@uid", userId);
                if ((int)checkUserCmd.ExecuteScalar() == 0)
                {
                    // user does not exist
                    throw new Exception($"User with ID {userId} does not exist.");
                }
            }

            // Check if already in THIS team
            using (var checkCurrentTeamCmd = new SqlCommand(
                "SELECT COUNT(*) FROM TeamMembers WHERE TeamId=@tid AND UserId=@uid", conn))
            {
                checkCurrentTeamCmd.Parameters.AddWithValue("@tid", teamId);
                checkCurrentTeamCmd.Parameters.AddWithValue("@uid", userId);
                if ((int)checkCurrentTeamCmd.ExecuteScalar() > 0)
                {
                    return AddMemberResult.AlreadyInThisTeam;
                }
            }

            // Check how many teams this user is already in
            using (var checkTeamsCountCmd = new SqlCommand(
                "SELECT COUNT(*) FROM TeamMembers WHERE UserId=@uid", conn))
            {
                checkTeamsCountCmd.Parameters.AddWithValue("@uid", userId);
                int count = (int)checkTeamsCountCmd.ExecuteScalar();
                if (count >= 2)
                {
                    return AddMemberResult.AlreadyInTwoTeams;
                }
            }

            // Insert if valid
            using (var insertCmd = new SqlCommand(
                "INSERT INTO TeamMembers (TeamId, UserId) VALUES (@tid, @uid)", conn))
            {
                insertCmd.Parameters.AddWithValue("@tid", teamId);
                insertCmd.Parameters.AddWithValue("@uid", userId);
                insertCmd.ExecuteNonQuery();
            }

            return AddMemberResult.Success;
        }

        public void RemoveMember(int teamId, int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM TeamMembers WHERE TeamId=@tid AND UserId=@uid", conn);
            cmd.Parameters.AddWithValue("@tid", teamId);
            cmd.Parameters.AddWithValue("@uid", userId);
            cmd.ExecuteNonQuery();
        }

        public void RemoveAllMembers(int teamId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("DELETE FROM TeamMembers WHERE TeamId=@tid", conn);
            cmd.Parameters.AddWithValue("@tid", teamId);
            cmd.ExecuteNonQuery();
        }

        public async Task<IEnumerable<Team>> GetTeamsByProjectId(int projectId)
        {
            var teams = new List<Team>();
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (SqlCommand command = new SqlCommand("dbo.sp_Teams_GetTeamsByProjectId", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@ProjectId", projectId);

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        Console.WriteLine( "in Repo");
                        while (await reader.ReadAsync())
                        {
                            teams.Add(new Team
                            {
                                TeamId = (int)reader["TeamId"],
                                TeamName = reader["TeamName"].ToString(),
                                ProjectId = reader["ProjectId"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["ProjectId"])
                            });
                        }
                    }
                }
            }
            return teams;
        }
    }
}
