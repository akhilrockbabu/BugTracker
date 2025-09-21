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
                    ProjectId = (int)reader["ProjectId"]
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
                    ProjectId = (int)reader["ProjectId"]
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
            cmd.Parameters.AddWithValue("@projectId", team.ProjectId);
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

            // first delete members
            using (var cmd1 = new SqlCommand("DELETE FROM TeamMembers WHERE TeamId=@id", conn))
            {
                cmd1.Parameters.AddWithValue("@id", teamId);
                cmd1.ExecuteNonQuery();
            }
            // then delete team
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
                    ProjectId = (int)reader["ProjectId"]
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

        public void AddMember(int teamId, int userId)
        {
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            using var cmd = new SqlCommand("INSERT INTO TeamMembers (TeamId,UserId) VALUES (@tid,@uid)", conn);
            cmd.Parameters.AddWithValue("@tid", teamId);
            cmd.Parameters.AddWithValue("@uid", userId);
            cmd.ExecuteNonQuery();
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
                        while (await reader.ReadAsync())
                        {
                            teams.Add(new Team
                            {
                                TeamId = (int)reader["TeamId"],
                                TeamName = reader["TeamName"].ToString(),
                                ProjectId = (int)reader["ProjectId"]
                            });
                        }
                    }
                }
            }
            return teams;
        }
    }
}