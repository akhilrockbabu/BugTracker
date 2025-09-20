
using BugTracker.Api.Models;
using BugTracker.Api.Repositories;
namespace BugTracker.Services
{



    public class TeamService
    {
        private readonly TeamRepository _teamRepo;

        public TeamService(TeamRepository teamRepo)
        {
            _teamRepo = teamRepo;
        }

        public List<Team> GetAllTeams() => _teamRepo.GetAllTeams();
        public Team GetTeamById(int id) => _teamRepo.GetTeamById(id);
        public int CreateTeam(Team team) => _teamRepo.CreateTeam(team);
        public void UpdateTeam(Team team) => _teamRepo.UpdateTeam(team);
        public void DeleteTeam(int id) => _teamRepo.DeleteTeam(id);
        public List<Team> GetTeamsByUser(int userId) => _teamRepo.GetTeamsByUser(userId);

        public List<int> GetTeamMembers(int teamId) => _teamRepo.GetTeamMemberIds(teamId);
        public void AddMember(int teamId, int userId) => _teamRepo.AddMember(teamId, userId);
        public void RemoveMember(int teamId, int userId) => _teamRepo.RemoveMember(teamId, userId);
        public void RemoveAllMembers(int teamId) => _teamRepo.RemoveAllMembers(teamId);
    }

}
