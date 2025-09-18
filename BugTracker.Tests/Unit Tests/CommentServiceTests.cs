using BugTracker.Api.DTOs;

using BugTracker.Api.Models;

using BugTracker.Api.Repositories;

using BugTracker.Api.Repositories.Interfaces;

using BugTracker.Api.Services;

using Moq;

using NUnit.Framework;

using System;

using System.Collections.Generic;

using System.Threading.Tasks;

namespace BugTracker.Tests.Services

{

    [TestFixture]

    public class CommentServiceTests

    {

        private Mock<ICommentRepository> _commentRepoMock;

        private CommentService _commentService;

        [SetUp]

        public void Setup()

        {

            _commentRepoMock = new Mock<ICommentRepository>();

            _commentService = new CommentService(_commentRepoMock.Object);

        }

        [Test]

        public async Task GetCommentsAsync_ShouldReturnComments()

        {

            _commentRepoMock.Setup(r => r.GetCommentsAsync())

                .ReturnsAsync(new List<CreateCommentDto>

                {

                    new CreateCommentDto { CommentId = 1, CommentText = "Test" }

                });

            var result = await _commentService.GetCommentsAsync();

            Assert.That(result, Is.Not.Null);

            Assert.That(((List<CreateCommentDto>)result).Count, Is.EqualTo(1));

        }

        [Test]

        public async Task AddCommentAsync_ShouldCallRepository()

        {

            var commentDto = new AddCommentDto { BugId = 1, UserId = 1, CommentText = "Hello" };

            _commentRepoMock.Setup(r => r.AddComment(commentDto)).Returns(1);

            var result = _commentService.AddComment(commentDto);

            Assert.That(result, Is.EqualTo(1));

            _commentRepoMock.Verify(r => r.AddComment(commentDto), Times.Once);

        }

        [Test]

        public void AddCommentAsync_ShouldThrow_WhenCommentIsNull()

        {

            Assert.That(

                () => _commentService.AddComment(null),

                Throws.TypeOf<ArgumentNullException>()

            );

        }

        [Test]

        public async Task DeleteCommentAsync_ShouldCallRepository()

        {

            _commentRepoMock.Setup(r => r.DeleteCommentAsync(1)).ReturnsAsync(true);

            var result = await _commentService.DeleteCommentAsync(1);

            Assert.That(result, Is.True);

            _commentRepoMock.Verify(r => r.DeleteCommentAsync(1), Times.Once);

        }

        [Test]

        public async Task UpdatedCommentAsync_UnitTrue()

        {

            var update = new UpdateCommentDto { CommentId = 1, CommentText = "updated Text" };

            _commentRepoMock.Setup(r => r.UpdateCommentAsync(update)).ReturnsAsync(true);

            var result = await _commentService.UpdateCommentAsync(update);

            Assert.That(result, Is.True);

            _commentRepoMock.Verify(r => r.UpdateCommentAsync(update), Times.Once);

        }

        [Test]

        public async Task UpdatedCommentAsync_UnitFalse()

        {

            var update = new UpdateCommentDto { CommentId = 1, CommentText = "Updated Text" };

            _commentRepoMock.Setup(r => r.UpdateCommentAsync(update)).ReturnsAsync(false);

            var result = await _commentService.UpdateCommentAsync(update);

            Assert.That(result, Is.False);

            //_commentRepoMock.Verify(r => r.UpdateCommentAsync(update), Times.Once);

        }

        [Test]

        public void UpdatedCommentAsync_UnitNull()

        {

            Assert.That(

                async () => await _commentService.UpdateCommentAsync(null),

                Throws.TypeOf<ArgumentNullException>()

            );

        }

    }

}

