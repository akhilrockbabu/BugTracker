using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using NUnit.Framework;
using BugTracker.Api.Models;
using BugTracker.Api.Repositories.Interfaces;
using BugTracker.Api.DTOs.Bug;
using BugTracker.Api.Services;
namespace BugTracker.Tests.Services
{
    [TestFixture]
    public class BugServiceTests
    {
        private Mock<IBugRepository> _bugRepoMock;
        private Mock<IProjectRepository> _projectRepoMock;
        private Mock<IUserRepository> _userRepoMock;
        private BugService _bugService;

        [SetUp]
        public void Setup()
        {
            _bugRepoMock = new Mock<IBugRepository>();
            _projectRepoMock = new Mock<IProjectRepository>();
            _userRepoMock = new Mock<IUserRepository>();

            _bugService = new BugService(
                _bugRepoMock.Object,
                _projectRepoMock.Object,
                _userRepoMock.Object
            );
        }

        // ------------------------
        // AddBugAsync
        // ------------------------
        [Test]
        public async Task AddBugAsync_ShouldGenerateReferenceId_AndSaveBug()
        {
            var bug = new Bug { ProjectId = 1, Title = "Bug1" };

            _projectRepoMock.Setup(r => r.GetProject(1))
                .Returns(new Project { ProjectId = 1, ProjectKey = "PRJ", ProjectName = "TestProj" });

            _bugRepoMock.Setup(r => r.GetMaxNumberAsync(1)).ReturnsAsync(5);
            _bugRepoMock.Setup(r => r.AddBugAsync(It.IsAny<Bug>())).ReturnsAsync(123);

            var result = await _bugService.AddBugAsync(bug);

            Assert.That(result, Is.EqualTo(123));
            Assert.That(bug.ReferenceId, Does.StartWith("PRJ-"));
            _bugRepoMock.Verify(r => r.AddBugAsync(It.IsAny<Bug>()), Times.Once);
        }

        [Test]
        public void AddBugAsync_ShouldThrow_WhenProjectNotFound()
        {
            var bug = new Bug { ProjectId = 1 };

            _projectRepoMock.Setup(r => r.GetProject(1)).Returns((Project)null);

            Assert.That(
                async () => await _bugService.AddBugAsync(bug),
                Throws.TypeOf<Exception>()
            );
        }

        [Test]
        public void AddBugAsync_ShouldThrow_WhenProjectKeyMissing()
        {
            var bug = new Bug { ProjectId = 1 };

            _projectRepoMock.Setup(r => r.GetProject(1))
                .Returns(new Project { ProjectId = 1, ProjectKey = "", ProjectName = "Test" });

            Assert.That(
                async () => await _bugService.AddBugAsync(bug),
                Throws.TypeOf<Exception>()
            );
        }

        // ------------------------
        // UpdateBugAsync
        // ------------------------
        [Test]
        public async Task UpdateBugAsync_ShouldCallRepository()
        {
            var bug = new Bug { BugId = 1 };
            _bugRepoMock.Setup(r => r.UpdateBugAsync(bug)).ReturnsAsync(true);

            var result = await _bugService.UpdateBugAsync(bug);

            Assert.That(result, Is.True);
            _bugRepoMock.Verify(r => r.UpdateBugAsync(bug), Times.Once);
        }

        [Test]
        public void UpdateBugAsync_ShouldThrow_WhenBugIsNull()
        {
            Assert.That(
                async () => await _bugService.UpdateBugAsync(null),
                Throws.TypeOf<ArgumentNullException>()
            );
        }

        // ------------------------
        // UpdateBugStatusAsync
        // ------------------------
        [Test]
        public async Task UpdateBugStatusAsync_ShouldAllowQAOrAdminToResolve()
        {
            var bug = new Bug { BugId = 1, AssignedTo = 5 };
            var user = new User { UserId = 5, Role = "QA" };

            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1)).ReturnsAsync(bug);
            _userRepoMock.Setup(r => r.GetUserByIdAsync(5)).ReturnsAsync(user);
            _bugRepoMock.Setup(r => r.UpdateBugStatusAsync(1, "Resolved")).ReturnsAsync(true);

            var result = await _bugService.UpdateBugStatusAsync(1, "Resolved", 5);

            Assert.That(result, Is.True);
        }

        [Test]
        public void UpdateBugStatusAsync_ShouldThrow_IfBugNotFound()
        {
            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1)).ReturnsAsync((Bug)null);

            Assert.That(
                async () => await _bugService.UpdateBugStatusAsync(1, "Open", 5),
                Throws.TypeOf<Exception>()
            );
        }

        [Test]
        public void UpdateBugStatusAsync_ShouldThrow_IfUserNotAuthorized()
        {
            var bug = new Bug { BugId = 1, AssignedTo = 5 };
            var user = new User { UserId = 2, Role = "Developer" };

            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1)).ReturnsAsync(bug);
            _userRepoMock.Setup(r => r.GetUserByIdAsync(2)).ReturnsAsync(user);

            Assert.That(
                async () => await _bugService.UpdateBugStatusAsync(1, "Resolved", 2),
                Throws.TypeOf<UnauthorizedAccessException>()
            );
        }

        [Test]
        public void UpdateBugStatusAsync_ShouldThrow_IfNotAssignedToUser()
        {
            var bug = new Bug { BugId = 1, AssignedTo = 5 };
            var user = new User { UserId = 6, Role = "QA" };

            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1)).ReturnsAsync(bug);
            _userRepoMock.Setup(r => r.GetUserByIdAsync(6)).ReturnsAsync(user);

            Assert.That(
                async () => await _bugService.UpdateBugStatusAsync(1, "Resolved", 6),
                Throws.TypeOf<UnauthorizedAccessException>()
            );
        }

        // ------------------------
        // AssignBugAsync
        // ------------------------
        [Test]
        public async Task AssignBugAsync_ShouldAssign_WhenBugExists()
        {
            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1))
                .ReturnsAsync(new Bug { BugId = 1 });

            _bugRepoMock.Setup(r => r.AssignBugAsync(1, 10)).ReturnsAsync(true);

            var result = await _bugService.AssignBugAsync(1, 10);

            Assert.That(result, Is.True);
        }

        [Test]
        public void AssignBugAsync_ShouldThrow_WhenBugNotFound()
        {
            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1))
                .ReturnsAsync((Bug)null);

            Assert.That(
                async () => await _bugService.AssignBugAsync(1, 10),
                Throws.TypeOf<Exception>()
            );
        }

        // ------------------------
        // GetBugByIdAsync
        // ------------------------
        [Test]
        public async Task GetBugByIdAsync_ShouldReturnBug()
        {
            _bugRepoMock.Setup(r => r.GetBugByIdAsync(1))
                .ReturnsAsync(new Bug { BugId = 1 });

            var result = await _bugService.GetBugByIdAsync(1);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.BugId, Is.EqualTo(1));
        }

        // ------------------------
        // GetBugsAsync
        // ------------------------
        [Test]
        public async Task GetBugsAsync_ShouldReturnList()
        {
            _bugRepoMock.Setup(r => r.GetBugsAsync(null, null, 1, 10,null))
                .ReturnsAsync(new List<Bug> { new Bug(), new Bug() });

            var result = await _bugService.GetBugsAsync();

            Assert.That(result, Is.Not.Null);
            Assert.That(((List<Bug>)result).Count, Is.EqualTo(2));
        }

        // ------------------------
        // SearchBugsAsync
        // ------------------------
        [Test]
        public async Task SearchBugsAsync_ShouldReturnResults()
        {
            _bugRepoMock.Setup(r => r.SearchBugsAsync("test"))
                .ReturnsAsync(new List<Bug> { new Bug() });

            var result = await _bugService.SearchBugsAsync("test");

            Assert.That(((List<Bug>)result).Count, Is.GreaterThan(0));
        }

        // ------------------------
        // GetBugSummaryAsync
        // ------------------------
        [Test]
        public async Task GetBugSummaryAsync_ShouldReturnSummary()
        {
            var summary = new BugSummaryDto { TotalBugs = 10 };

            _bugRepoMock.Setup(r => r.GetBugSummaryAsync())
                .ReturnsAsync(summary);

            var result = await _bugService.GetBugSummaryAsync();

            Assert.That(result.TotalBugs, Is.EqualTo(10));
        }
    }
}
