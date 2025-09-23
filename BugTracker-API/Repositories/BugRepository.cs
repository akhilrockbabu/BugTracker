using BugTracker.Api.Models;
using BugTracker.Api.Repositories.Interfaces;
using BugTracker.Api.DTOs;
using Microsoft.Data.SqlClient;
using System.Data;
using BugTracker.Api.DTOs.Bug;
using BugTracker.DTOs.Bug.BugTracker.DTOs.Bug;

namespace BugTracker.Api.Repositories
{
    public class BugRepository : IBugRepository
    {
        private readonly string _connectionString;

        public BugRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

    

      // 1. Add a new bug
public async Task<int> AddBugAsync(Bug bug)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    using (SqlCommand cmd = new SqlCommand("sp_AddBug", conn))
    {
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.AddWithValue("@ReferenceId", bug.ReferenceId);
        cmd.Parameters.AddWithValue("@ProjectId", bug.ProjectId);
        cmd.Parameters.AddWithValue("@Title", bug.Title);
        cmd.Parameters.AddWithValue("@Description", bug.Description);
        cmd.Parameters.AddWithValue("@Priority", bug.Priority);
        cmd.Parameters.AddWithValue("@Status", bug.Status);
        cmd.Parameters.AddWithValue("@CreatedAt", bug.CreatedAt);
        cmd.Parameters.AddWithValue("@CreatedBy", bug.CreatedBy);
        cmd.Parameters.AddWithValue("@TeamId", (object?)bug.TeamId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@AssignedTo", bug.AssignedTo);
                Console.WriteLine(bug.TeamId);
        await conn.OpenAsync();
        object result = await cmd.ExecuteScalarAsync();

        // Handle null result safely
        if (result != null && int.TryParse(result.ToString(), out int newBugId))
        {
            return newBugId;
        }

        // If no value was returned, return -1 or throw depending on how you want to handle it
        return -1;
    }
}


        // 2. Update bug status
        public async Task<bool> UpdateBugStatusAsync(int bugId, string status)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_UpdateBugStatus", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BugId", bugId);
                    cmd.Parameters.AddWithValue("@Status", status);

                    await conn.OpenAsync();
                    return await cmd.ExecuteNonQueryAsync() > 0;
                }
            }
        }

        // 3. Assign bug to a user
        public async Task<bool> AssignBugAsync(int bugId, int userId)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_AssignBug", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BugId", bugId);
                    cmd.Parameters.AddWithValue("@userId", userId);

                    await conn.OpenAsync();
                    return await cmd.ExecuteNonQueryAsync() > 0;
                }
            }
        }

        // 4. Get a single bug by ID
        public async Task<Bug> GetBugByIdAsync(int bugId)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetBugById", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BugId", bugId);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Bug
                            {
                                BugId = reader["BugId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["BugId"]),
                                ReferenceId = reader["ReferenceId"] == DBNull.Value ? null : reader["ReferenceId"].ToString(),
                                ProjectId = reader["ProjectId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ProjectId"]),
                                Title = reader["Title"] == DBNull.Value ? null : reader["Title"].ToString(),
                                Description = reader["Description"] == DBNull.Value ? null : reader["Description"].ToString(),
                                Priority = reader["Priority"] == DBNull.Value ? null : reader["Priority"].ToString(),
                                Status = reader["Status"] == DBNull.Value ? null : reader["Status"].ToString(),
                                CreatedAt = reader["CreatedAt"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader["CreatedAt"]),
                                CreatedBy = reader["CreatedBy"] == DBNull.Value ? 0 : Convert.ToInt32(reader["CreatedBy"]),
                                AssignedTo = reader["AssignedTo"] == DBNull.Value ? 0 : Convert.ToInt32(reader["AssignedTo"]),
                                TeamId = reader["TeamId"]== DBNull.Value ? 0 : Convert.ToInt32(reader["TeamId"])
                            };

                        }
                        return null;
                    }
                }
            }
        }

        // 5. Get all bugs
        public async Task<IEnumerable<AdminGetAllBugsDto>> GetAllBugsAsync()
        {
            var bugs = new List<AdminGetAllBugsDto>();

            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand("dbo.sp_Bugs_GetAllBugs", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            bugs.Add(new AdminGetAllBugsDto
                            {
                                BugId = (int)reader["BugId"],
                                Title = reader["Title"].ToString(),
                                Priority = reader["Priority"].ToString(),
                                Status = reader["Status"].ToString(),
                                // Read the new, correct column names from the JOINs
                                ProjectName = reader["ProjectName"].ToString(),
                                TeamName = reader["TeamName"].ToString(),
                                CreatedByName = reader["CreatedByName"].ToString(),
                                AssignedToName = reader["AssignedToName"].ToString()
                            });
                        }
                    }
                }
            }

            return bugs;
        }

        public async Task<IEnumerable<Bug>> GetBugsAsync(string status = null, int? assignedTo = null, int page = 1, int pageSize = 10, int? TeamId=null)
        {
            var bugs = new List<Bug>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_GetBugs", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Status", (object?)status ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@AssignedTo", (object?)assignedTo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Page", page);
                cmd.Parameters.AddWithValue("@PageSize", pageSize);
                cmd.Parameters.AddWithValue("@TeamId", TeamId);

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        bugs.Add(new Bug
                        {
                            BugId = Convert.ToInt32(reader["BugId"]),
                            ReferenceId = reader["ReferenceId"].ToString(),
                            ProjectId = Convert.ToInt32(reader["ProjectId"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Priority = reader["Priority"].ToString(),
                            Status = reader["Status"].ToString(),
                            CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                            CreatedBy = Convert.ToInt32(reader["CreatedBy"]),
                            AssignedTo = reader["AssignedTo"] == DBNull.Value ? null : Convert.ToInt32(reader["AssignedTo"])
                        });
                    }
                }
            }

            return bugs;
        }

        public async Task<IEnumerable<Bug>> GetBugsByProjectIdAsync(int projectId)
        {
            var bugs = new List<Bug>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_GetBugsByProject", conn)) // we’ll create this SP
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ProjectId", projectId);

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        bugs.Add(new Bug
                        {
                            BugId = reader["BugId"] != DBNull.Value ? Convert.ToInt32(reader["BugId"]) : 0,
                            ReferenceId = reader["ReferenceId"]?.ToString(),
                            ProjectId = reader["ProjectId"] != DBNull.Value ? Convert.ToInt32(reader["ProjectId"]) : 0,
                            TeamId = reader["TeamId"] != DBNull.Value ? Convert.ToInt32(reader["TeamId"]) : (int?)null,
                            Title = reader["Title"]?.ToString(),
                            Description = reader["Description"]?.ToString(),
                            Priority = reader["Priority"]?.ToString(),
                            Status = reader["Status"]?.ToString(),
                            CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : DateTime.MinValue,
                            CreatedBy = reader["CreatedBy"] != DBNull.Value ? Convert.ToInt32(reader["CreatedBy"]) : 0,
                            AssignedTo = reader["AssignedTo"] != DBNull.Value ? Convert.ToInt32(reader["AssignedTo"]) : (int?)null
                        });

                    }
                }
            }

            return bugs;
        }

        public async Task<bool> UpdateBugAsync(Bug bug)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_UpdateBug", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@BugId", bug.BugId);
                cmd.Parameters.AddWithValue("@Title", bug.Title ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Description", bug.Description ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Priority", bug.Priority ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@AssignedTo", bug.AssignedTo == 0 ? (object)DBNull.Value : bug.AssignedTo);
                cmd.Parameters.AddWithValue("@TeamId", bug.TeamId == 0 ? (object)DBNull.Value : bug.TeamId);

                await conn.OpenAsync();
                return await cmd.ExecuteNonQueryAsync() > 0;
            }
        }



        public async Task<IEnumerable<Bug>> SearchBugsAsync(string keyword)
        {
            var bugs = new List<Bug>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_SearchBugs", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Keyword", keyword);

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        bugs.Add(new Bug
                        {
                            BugId = Convert.ToInt32(reader["BugId"]),
                            ReferenceId = reader["ReferenceId"].ToString(),
                            ProjectId = Convert.ToInt32(reader["ProjectId"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Priority = reader["Priority"].ToString(),
                            Status = reader["Status"].ToString(),
                            CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                            CreatedBy = Convert.ToInt32(reader["CreatedBy"]),
                            AssignedTo = reader["AssignedTo"] == DBNull.Value ? null : Convert.ToInt32(reader["AssignedTo"])
                        });
                    }
                }
            }

            return bugs;
        }


        public async Task<BugSummaryDto> GetBugSummaryAsync(int? teamId = null)
        {
            var summary = new BugSummaryDto();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_GetBugSummary", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@TeamId", (object?)teamId ?? DBNull.Value);

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        summary.TotalBugs = Convert.ToInt32(reader["TotalBugs"]);
                        summary.OpenBugs = Convert.ToInt32(reader["OpenBugs"]);
                        summary.InProgressBugs = Convert.ToInt32(reader["InProgressBugs"]);
                        summary.ClosedBugs = Convert.ToInt32(reader["ClosedBugs"]);
                        summary.AssignedBugs = Convert.ToInt32(reader["AssignedBugs"]);
                    }
                }
            }

            return summary;
        }

        public async Task<int> GetMaxNumberAsync(int projectId)
        {

            using (SqlConnection conn = new SqlConnection(_connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_MaxId", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@projectId", projectId);
                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                        return reader["maximumId"] != DBNull.Value
                        ? Convert.ToInt32(reader["maximumId"])
                        : 0;
                }

            }
            return 0;

        }
    }
}