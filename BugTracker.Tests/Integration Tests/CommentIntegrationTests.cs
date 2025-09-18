using BugTracker.Api.DTOs;

using BugTracker.Api.Models;

using BugTracker.Api.Repositories;

using Microsoft.Extensions.Configuration;

using Microsoft.IdentityModel.Tokens;

using NUnit.Framework;

using Swashbuckle.AspNetCore.SwaggerGen;

using System;

using System.Linq;

using System.Threading.Tasks;

using System.Xml.Linq;

namespace BugTracker.Tests.Integration_Tests

{

    [TestFixture]

    public class CommentIntegrationTests

    {

        //private readonly string _connectionString =

        //    "Server=localhost;Database=BugTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;";

        private CommentRepository _repo;

        [SetUp]

        public void Setup()

        {

            var inMemorySettings = new Dictionary<string, string>{
    {"ConnectionStrings:DefaultConnection",
     "Server=localhost;Database=BugTrackerDb;Trusted_Connection=True;TrustServerCertificate=True;"}
};


            IConfiguration configuration = new ConfigurationBuilder()

                .AddInMemoryCollection(inMemorySettings)

                .Build();

            _repo = new CommentRepository(configuration);

        }

        private AddCommentDto CreateTestCommentDto(string text = null)

        {

            return new AddCommentDto

            {

                BugId = 1,

                UserId = 1,

                CommentText = text ?? "Integration Test Comment " + Guid.NewGuid()

            };

        }

        [Test]

        public async Task GetCommentsAsync_ShouldReturnList()

        {

            var comments = await _repo.GetCommentsAsync();

            Assert.That(comments, Is.Not.Null);

        }

        [Test]

        public async Task AddCommentAsync_ShouldInsertComment()

        {

            var commentDto = new AddCommentDto

            {

                BugId = 1,

                UserId = 1,

                CommentText = "Integration Test Comment"

            };

            int newId = _repo.AddComment(commentDto);

            Assert.That(newId, Is.GreaterThan(0));

            var dbComments = await _repo.GetCommentsAsync();

            Assert.That(dbComments.Any(c => c.CommentId == newId), Is.True);

        }


        [Test]

        public async Task GetCommentByIdAsync_ShouldReturnInsertedComment()

        {

            var commentDton = CreateTestCommentDto();

            int newId = _repo.AddComment(commentDton);

            var commentI = await _repo.GetCommentByIdAsync(newId);

            Assert.That(commentI, Is.Not.Null, "Comment should not be null");

            Assert.That(commentI.CommentId, Is.EqualTo(newId), "CommentId should match inserted Id");

            Assert.That(commentI.CommentText, Is.EqualTo(commentDton.CommentText), "CommentText should match inserted Id");

        }

        [Test]

        public async Task GetCommentByBugId_()

        {

            var commentDto = CreateTestCommentDto();

            int newId = _repo.AddComment(commentDto);

            var comment = await _repo.GetCommentByBugIdAsync(commentDto.BugId);

            Assert.That(comment, Is.Not.Null, "Comment should not be null");

            Assert.That(comment.Any(c => c.CommentId == newId), Is.True, "Inserted comment should be returned");

            var insertedComment = comment.First(c => c.CommentId == newId);

            Assert.That(insertedComment.CommentText, Is.EqualTo(commentDto.CommentText), "Comment text should match");

        }

        [Test]

        public async Task GetCommentByUserId_()

        {

            var commentDto = CreateTestCommentDto();

            int newId = _repo.AddComment(commentDto);

            var comment = await _repo.GetCommentByUserIdAsync(commentDto.UserId);

            Assert.That(comment, Is.Not.Null, "Comment should not be null");

            Assert.That(comment.Any(c => c.CommentId == newId), Is.True, "Insert comment sholud e returend");

            var insertedData = comment.First(c => c.CommentId == newId);

            Assert.That(insertedData.CommentText, Is.EqualTo(commentDto.CommentText), "Comment text should match");

        }

        [Test]

        public async Task UpdateCommentAsync_()

        {

            var commentDto = CreateTestCommentDto("Before Update");

            int newId = _repo.AddComment(commentDto);

            var before = await _repo.GetCommentByIdAsync(newId);

            Console.WriteLine($"Inserted: Id={before.CommentId}, Text={before.CommentText}");

            var updateDto = new UpdateCommentDto { CommentId = newId, CommentText = "Updated comment" };

            var result = await _repo.UpdateCommentAsync(updateDto);

            Console.WriteLine($"Update result: {result}");

            var updated = await _repo.GetCommentByIdAsync(newId);

            Console.WriteLine($"After update: Id={updated?.CommentId}, Text={updated?.CommentText}");

            Assert.That(result, Is.True, "Update SP didn't return success");

            Assert.That(updated.CommentText, Is.EqualTo(updateDto.CommentText), "CommentText not updated");

        }

        [Test]

        public async Task DeleteCommentAsync_()

        {

            var commentDto = new AddCommentDto { BugId = 1, UserId = 1, CommentText = "Deleted date" };

            int newId = _repo.AddComment(commentDto);

            var result = await _repo.DeleteCommentAsync(newId);

            Assert.That(result, Is.True, "Deleted data not working");

            var deleted = await _repo.GetCommentByIdAsync(newId);

            Assert.That(deleted, Is.Null, "Delete comment Should not Exit");

            //var before = await _repo.GetCommentByBugIdAsync

        }

        //[Test]

        //public async Task UpdateCommentAsync_()

        //{

        //    var commentDto = CreateTestCommentDto();

        //    int newId = _repo.AddComment(commentDto);

        //    var before = await _repo.GetCommentByBugIdAsync(newId);

        //    //Console.WriteLine($"Inserted: Id={before.Union}, Text={before.CommentText}");

        //    var updateDto = new UpdateCommentDto { CommentId = newId, CommentText = "Update comment" };

        //    var result = await _repo.UpdateCommentAsync(updateDto);

        //    Assert.That(result, Is.True, "Updated data not Done");

        //    var updated = await _repo.GetCommentByIdAsync(newId);

        //    Assert.That(updated.CommentText, Is.EqualTo(updateDto.CommentText), "commnet not works");

        //}

    }

}

