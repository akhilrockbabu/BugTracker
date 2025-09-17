using NUnit.Framework;
using FluentAssertions;
using BugTracker.Api.Repositories;
using BugTracker.Api.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BugTracker.Tests.IntegrationTests
{
    [TestFixture]
    public class UserRepositoryTests
    {
        private IConfiguration _configuration;
        private UserRepository _userRepository;

        [SetUp]
        public void Setup()
        {
            // This setup uses the appsettings.json from your main project,
            // but the test environment will automatically override it with appsettings.Testing.json.
            var inMemorySettings = new Dictionary<string, string> {
                {"ConnectionStrings:DefaultConnection", "Server=localhost;Database=BugTrackerDb_Test;Trusted_Connection=True;TrustServerCertificate=True;"}
                // NOTE: Replace the connection string above with your actual test database connection string.
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _userRepository = new UserRepository(_configuration);
        }

        private (string username, string email, string role, string password) GetUniqueUserData(string prefix)
        {
            // Helper to generate unique user details for each test to avoid conflicts.
            string timestamp = DateTime.Now.Ticks.ToString();
            return ($"{prefix}_{timestamp}", $"{prefix}_{timestamp}@test.com", "Developer", "Password123!");
        }

        [Test]
        public async Task CreateNewUserAsync_ShouldInsertUser_AndReturnUserWithId()
        {
            // Arrange
            var (username, email, role, _) = GetUniqueUserData("create");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            // Act
            var createdUser = await _userRepository.CreateNewUserAsync(username, email, role, passwordHash);

            // Assert
            createdUser.Should().NotBeNull();
            createdUser.UserId.Should().BeGreaterThan(0);

            // Verify by fetching the user from the database
            var dbUser = await _userRepository.GetUserByIdAsync(createdUser.UserId);
            dbUser.Should().NotBeNull();
            dbUser!.UserName.Should().Be(username);
        }

        [Test]
        public async Task GetUserByIdAsync_WhenUserExists_ShouldReturnUser()
        {
            // Arrange
            var (username, email, role, _) = GetUniqueUserData("getbyid");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            var createdUser = await _userRepository.CreateNewUserAsync(username, email, role, passwordHash);

            // Act
            var result = await _userRepository.GetUserByIdAsync(createdUser.UserId);

            // Assert
            result.Should().NotBeNull();
            result!.UserId.Should().Be(createdUser.UserId);
            result.UserName.Should().Be(username);
        }

        [Test]
        public async Task GetUserByIdAsync_WhenUserDoesNotExist_ShouldReturnNull()
        {
            // Act
            var result = await _userRepository.GetUserByIdAsync(-999); // A non-existent ID

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public async Task UserExistAsync_WhenUserExists_ShouldReturnTrue()
        {
            // Arrange
            var (username, email, role, _) = GetUniqueUserData("exists");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            await _userRepository.CreateNewUserAsync(username, email, role, passwordHash);

            // Act
            var result = await _userRepository.UserExistAsync(username, email);

            // Assert
            result.Should().BeTrue();
        }

        [Test]
        public async Task UpdateUserAsync_ShouldModifyUserData()
        {
            // Arrange
            var (username, email, role, _) = GetUniqueUserData("update");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            var user = await _userRepository.CreateNewUserAsync(username, email, role, passwordHash);

            user.UserName = "UpdatedName";
            user.UserEmail = "updated@email.com";

            // Act
            await _userRepository.UpdateUserAsync(user);

            // Assert
            var updatedUser = await _userRepository.GetUserByIdAsync(user.UserId);
            updatedUser.Should().NotBeNull();
            updatedUser!.UserName.Should().Be("UpdatedName");
            updatedUser.UserEmail.Should().Be("updated@email.com");
        }

        [Test]
        public async Task DeleteUserAsync_WhenUserExists_ShouldReturnTrue()
        {
            // Arrange
            var (username, email, role, _) = GetUniqueUserData("delete");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            var user = await _userRepository.CreateNewUserAsync(username, email, role, passwordHash);

            // Act
            var result = await _userRepository.DeleteUserAsync(user.UserId);

            // Assert
            result.Should().BeTrue();
            var deletedUser = await _userRepository.GetUserByIdAsync(user.UserId);
            deletedUser.Should().BeNull();
        }
    }
}
