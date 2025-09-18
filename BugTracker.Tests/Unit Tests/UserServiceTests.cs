using NUnit.Framework;
using Moq;
using FluentAssertions;
using BugTracker.Api.Services;
using BugTracker.Api.Repositories.Interfaces;
using BugTracker.Api.Models;
using BugTracker.Api.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace BugTracker.Tests.Services
{
    [TestFixture]
    public class UserServiceUnitTests
    {
        private Mock<IUserRepository> _mockUserRepository;
        private UserService _userService;

        [SetUp]
        public void Setup()
        {
            // This method runs before each test, providing a fresh and isolated test environment.
            _mockUserRepository = new Mock<IUserRepository>();

            // Mock the IConfiguration to provide JWT settings needed for the LoginAsync method.
            var jwtSettings = new Dictionary<string, string>
            {
                {"Jwt:Key", "YourSuperSecretKeyForTestingThatIsLongEnoughAndSecure"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(jwtSettings!).Build();

            // Create the service instance with the mocked dependencies.
            _userService = new UserService(_mockUserRepository.Object, configuration);
        }

        #region GetUserByIdAsync Tests

        [Test]
        public async Task GetUserByIdAsync_WhenUserExists_ShouldReturnUser()
        {
            // Arrange
            var fakeUser = new User { UserId = 1, UserName = "TestUser" };
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(1)).ReturnsAsync(fakeUser);

            // Act
            var result = await _userService.GetUserByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(fakeUser);
        }

        [Test]
        public async Task GetUserByIdAsync_WhenUserDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(It.IsAny<int>())).ReturnsAsync((User?)null);

            // Act
            var result = await _userService.GetUserByIdAsync(99);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public void GetUserByIdAsync_WithInvalidId_ShouldThrowArgumentException()
        {
            // Act & Assert
            // Using NUnit's native exception assertion to check business logic.
            Assert.ThrowsAsync<ArgumentException>(() => _userService.GetUserByIdAsync(0));
        }

        #endregion

        #region CreateNewUserAsync Tests

        [Test]
        public async Task CreateNewUserAsync_WithUniqueDetails_ShouldCreateAndReturnUser()
        {
            // Arrange
            var username = "NewUser";
            var email = "new@test.com";
            var role = "Tester";
            var password = "Password123";
            var expectedUser = new User { UserId = 1, UserName = username, UserEmail = email, Role = role };

            _mockUserRepository.Setup(repo => repo.UserExistAsync(username, email)).ReturnsAsync(false);
            _mockUserRepository.Setup(repo => repo.CreateNewUserAsync(username, email, role, It.IsAny<string>()))
                               .ReturnsAsync(expectedUser);

            // Act
            var result = await _userService.CreateNewUserAsync(username, email, role, password);

            // Assert
            result.Should().BeEquivalentTo(expectedUser);
        }

        [Test]
        public void CreateNewUserAsync_WhenUserAlreadyExists_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var username = "ExistingUser";
            var email = "existing@test.com";
            _mockUserRepository.Setup(repo => repo.UserExistAsync(username, email)).ReturnsAsync(true);

            // Act & Assert
            Assert.ThrowsAsync<InvalidOperationException>(() => _userService.CreateNewUserAsync(username, email, "Role", "Password"));
        }

        #endregion

        #region UpdateUserAsync Tests

        [Test]
        public async Task UpdateUserAsync_WhenUserExists_ShouldReturnUpdatedUser()
        {
            // Arrange
            var userId = 1;
            var userUpdateDto = new UpdateUserDTO { UserName = "UpdatedName", UserEmail = "updated@test.com", Role = "Admin" };
            var existingUser = new User { UserId = userId, UserName = "OldName", UserEmail = "old@test.com", Role = "Developer" };

            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId)).ReturnsAsync(existingUser);
            _mockUserRepository.Setup(repo => repo.UpdateUserAsync(It.IsAny<User>())).ReturnsAsync((User user) => user);

            // Act
            var result = await _userService.UpdateUserAsync(userId, userUpdateDto);

            // Assert
            result.Should().NotBeNull();
            result!.UserName.Should().Be("UpdatedName");
            result.UserEmail.Should().Be("updated@test.com");
        }

        [Test]
        public async Task UpdateUserAsync_WhenUserDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            var userId = 99;
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId)).ReturnsAsync((User?)null);

            // Act
            var result = await _userService.UpdateUserAsync(userId, new UpdateUserDTO());

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region UpdatePasswordAsync Tests

        [Test]
        public async Task UpdatePasswordAsync_WithValidDetails_ShouldReturnTrue()
        {
            // Arrange
            var userId = 1;
            var passwordDto = new UpdatePasswordDTO { CurrentPassword = "OldPassword", NewPassword = "NewPassword123", ConfirmNewPassword = "NewPassword123" };
            var storedHash = BCrypt.Net.BCrypt.HashPassword("OldPassword");
            _mockUserRepository.Setup(repo => repo.GetUserPasswordAsync(userId)).ReturnsAsync(storedHash);

            // Act
            var result = await _userService.UpdatePasswordAsync(userId, passwordDto);

            // Assert
            result.Should().BeTrue();
            _mockUserRepository.Verify(repo => repo.UpdatePasswordAsync(userId, It.IsAny<string>()), Times.Once);
        }

        [Test]
        public void UpdatePasswordAsync_WithMismatchedNewPasswords_ShouldThrowArgumentException()
        {
            // Arrange
            var passwordDto = new UpdatePasswordDTO { NewPassword = "NewPassword123", ConfirmNewPassword = "DoesNotMatch" };

            // Act & Assert
            Assert.ThrowsAsync<ArgumentException>(() => _userService.UpdatePasswordAsync(1, passwordDto));
        }

        #endregion

        #region LoginAsync Tests

        [Test]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnLoginResponse()
        {
            // Arrange
            var loginRequest = new LoginRequestDTO { LoginIdentifier = "TestUser", Password = "Password123" };
            var userWithPassword = new UserWithPasswordDTO
            {
                UserId = 1,
                UserName = "TestUser",
                Email = "test@soti.net",
                Role = "Developer",
                Password = BCrypt.Net.BCrypt.HashPassword("Password123")
            };
            _mockUserRepository.Setup(repo => repo.GetUserByLoginIdentifierAsync(loginRequest.LoginIdentifier!)).ReturnsAsync(userWithPassword);

            // Act
            var result = await _userService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().NotBeNullOrEmpty();
            result.UserName.Should().Be(loginRequest.LoginIdentifier);
        }

        [Test]
        public async Task LoginAsync_WhenUserNotFound_ShouldReturnNull()
        {
            // Arrange
            var loginRequest = new LoginRequestDTO { LoginIdentifier = "NotFoundUser", Password = "password" };
            _mockUserRepository.Setup(repo => repo.GetUserByLoginIdentifierAsync(It.IsAny<string>())).ReturnsAsync((UserWithPasswordDTO?)null);

            // Act
            var result = await _userService.LoginAsync(loginRequest);

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region SearchUsersAsync Tests

        [Test]
        public async Task SearchUsersAsync_WithValidTerm_ShouldReturnMatchingUsers()
        {
            // Arrange
            var searchTerm = "test";
            var fakeUsers = new List<User> { new User { UserId = 1, UserName = "TestUser1" } };
            _mockUserRepository.Setup(repo => repo.SearchUserByUsernameAsync(searchTerm)).ReturnsAsync(fakeUsers);

            // Act
            var result = await _userService.SearchUserByUsernameAsync(searchTerm);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.Should().BeEquivalentTo(fakeUsers);
        }

        #endregion
    }
}

