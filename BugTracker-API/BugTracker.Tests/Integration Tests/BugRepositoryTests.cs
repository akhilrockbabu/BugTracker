using BugTracker.Api.Models;
using BugTracker.Api.Repositories;
using BugTracker.Api.DTOs.Bug;
using NUnit.Framework;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BugTracker.Tests.Integration_Tests
{
    public class BugRepositoryTests
    {
        private readonly string _connectionString =
            "Server=localhost;Database=BugTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;";

        private BugRepository _repo;

        [SetUp]
        public void Setup()
        {
            _repo = new BugRepository(_connectionString);
        }

        private Bug CreateTestBug(string title = "Test Bug", string status = "Open")
        {
            return new Bug
            {
                ReferenceId = Guid.NewGuid().ToString(),
                ProjectId = 1,
                Title = title,
                Description = "Test Description",
                Priority = "Low",
                Status = status,
                CreatedAt = DateTime.Now,
                CreatedBy = 1,
                AssignedTo = null
            };
        }

        // 1. AddBugAsync
        [Test]
        public async Task AddBugAsync_ShouldInsertBug()
        {
            var bug = CreateTestBug();

            int newId = await _repo.AddBugAsync(bug);

            Assert.That(newId, Is.GreaterThan(0));

            var dbBug = await _repo.GetBugByIdAsync(newId);
            Assert.That(dbBug, Is.Not.Null);
            Assert.That(dbBug.Title, Is.EqualTo(bug.Title));
        }

        // 2. UpdateBugStatusAsync
        [Test]
        public async Task UpdateBugStatusAsync_ShouldChangeStatus()
        {
            var bug = CreateTestBug(status: "Open");
            int id = await _repo.AddBugAsync(bug);

            bool result = await _repo.UpdateBugStatusAsync(id, "Closed");

            Assert.That(result, Is.True);

            var dbBug = await _repo.GetBugByIdAsync(id);
            Assert.That(dbBug.Status, Is.EqualTo("Closed"));
        }

        // 3. AssignBugAsync
        [Test]
        public async Task AssignBugAsync_ShouldAssignToUser()
        {
            var bug = CreateTestBug();
            int id = await _repo.AddBugAsync(bug);

            bool result = await _repo.AssignBugAsync(id, 2);

            Assert.That(result, Is.True);

            var dbBug = await _repo.GetBugByIdAsync(id);
            Assert.That(dbBug.AssignedTo, Is.EqualTo(2));
        }

        // 4. GetBugByIdAsync
        [Test]
        public async Task GetBugByIdAsync_ShouldReturnBug()
        {
            var bug = CreateTestBug();
            int id = await _repo.AddBugAsync(bug);

            var dbBug = await _repo.GetBugByIdAsync(id);

            Assert.That(dbBug, Is.Not.Null);
            Assert.That(dbBug.BugId, Is.EqualTo(id));
        }

        [Test]
        public async Task GetBugByIdAsync_InvalidId_ReturnsNull()
        {
            var result = await _repo.GetBugByIdAsync(-999);
            Assert.That(result, Is.Null);
        }

        // 5. GetAllBugsAsync
        [Test]
        public async Task GetAllBugsAsync_ShouldReturnList()
        {
            var bugs = await _repo.GetAllBugsAsync();
            Assert.That(bugs, Is.Not.Null);
        }

        // 6. GetBugsAsync (with filters and paging)
        [Test]
        public async Task GetBugsAsync_ShouldReturnFiltered()
        {
            var bug = CreateTestBug(status: "In Progress");
            int id = await _repo.AddBugAsync(bug);

            var filtered = await _repo.GetBugsAsync(status: "In Progress", page: 1, pageSize: 5);

            Assert.That(filtered.Any(b => b.BugId == id), Is.True);
        }

        // 7. UpdateBugAsync
        [Test]
        public async Task UpdateBugAsync_ShouldModifyBug()
        {
            var bug = CreateTestBug();
            int id = await _repo.AddBugAsync(bug);

            bug.BugId = id;
            bug.Title = "Updated Title";

            bool result = await _repo.UpdateBugAsync(bug);
            Assert.That(result, Is.True);

            var updated = await _repo.GetBugByIdAsync(id);
            Assert.That(updated.Title, Is.EqualTo("Updated Title"));
        }

        // 8. SearchBugsAsync
        [Test]
        public async Task SearchBugsAsync_ShouldFindMatchingBugs()
        {
            var bug = CreateTestBug(title: "Special Search Keyword");
            int id = await _repo.AddBugAsync(bug);

            var results = await _repo.SearchBugsAsync("Special Search");

            Assert.That(results.Any(b => b.BugId == id), Is.True);
        }

        // 9. GetBugSummaryAsync
        [Test]
        public async Task GetBugSummaryAsync_ShouldReturnSummary()
        {
            var summary = await _repo.GetBugSummaryAsync();
            Assert.That(summary, Is.Not.Null);
            Assert.That(summary.TotalBugs, Is.GreaterThanOrEqualTo(0));
        }

        // 10. GetMaxNumberAsync
        [Test]
        public async Task GetMaxNumberAsync_ShouldReturnValue()
        {
            var max = await _repo.GetMaxNumberAsync(1);
            Assert.That(max, Is.GreaterThanOrEqualTo(0));
        }
    }
}
