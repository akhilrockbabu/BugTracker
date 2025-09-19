using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace BugTracker.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BugLabelController : ControllerBase
    {
        private readonly string _connectionString;

        public BugLabelController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // GET: api/BugLabel
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BugLabel>>> GetBugLabels()
        {
            var bugLabels = new List<BugLabel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "SELECT BugId, LabelId FROM BugLabels";
                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    await con.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            bugLabels.Add(new BugLabel
                            {
                                BugId = reader.GetInt32(0),
                                LabelId = reader.GetInt32(1)
                            });
                        }
                    }
                }
            }

            return Ok(bugLabels);
        }

        // POST: api/BugLabel
        [HttpPost]
        public async Task<ActionResult> PostBugLabel([FromBody] BugLabel bugLabel)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "INSERT INTO BugLabels (BugId, LabelId) VALUES (@BugId, @LabelId)";
                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@BugId", bugLabel.BugId);
                    cmd.Parameters.AddWithValue("@LabelId", bugLabel.LabelId);

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }

            return Ok(new { message = "BugLabel created successfully" });
        }

        // POST: api/BugLabel/Bulk
        [HttpPost("Bulk")]
        public async Task<ActionResult> PostBugLabelsBulk([FromBody] BugLabelBulkRequest request)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();
                foreach (var labelId in request.LabelIds)
                {
                    string query = "INSERT INTO BugLabels (BugId, LabelId) VALUES (@BugId, @LabelId)";
                    using (SqlCommand cmd = new SqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@BugId", request.BugId);
                        cmd.Parameters.AddWithValue("@LabelId", labelId);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
            }

            return Ok(new { message = "BugLabels created successfully" });
        }


        // DELETE: api/BugLabel/{bugId}/{labelId}
        [HttpDelete("{bugId}/{labelId}")]
        public async Task<ActionResult> DeleteBugLabel(int bugId, int labelId)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "DELETE FROM BugLabels WHERE BugId=@BugId AND LabelId=@LabelId";
                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@BugId", bugId);
                    cmd.Parameters.AddWithValue("@LabelId", labelId);

                    await con.OpenAsync();
                    int rows = await cmd.ExecuteNonQueryAsync();

                    if (rows == 0)
                        return NotFound();
                }
            }

            return NoContent();
        }

        // DELETE: api/BugLabel/DeleteByBug/5  (delete all labels for a bug)
        [HttpDelete("DeleteByBug/{bugId}")]
        public async Task<ActionResult> DeleteAllLabelsForBug(int bugId)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "DELETE FROM BugLabels WHERE BugId=@BugId";
                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@BugId", bugId);

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }

            return NoContent();
        }
    }

    public class BugLabel
    {
        public int BugId { get; set; }
        public int LabelId { get; set; }


    }

    public class BugLabelBulkRequest
    {
        public int BugId { get; set; }
        public List<int> LabelIds { get; set; }
    }
}
