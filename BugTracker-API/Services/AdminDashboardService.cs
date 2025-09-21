using BugTracker.DTOs;
using BugTracker.Repositories.Interfaces;
using BugTracker.Services.Interfaces;

namespace BugTracker.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IAdminDashboardRepository _dashboardRepository;

        public AdminDashboardService(IAdminDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public Task<AdminSummaryDto> GetAdminSummaryAsync()
        {
            return _dashboardRepository.GetAdminSummaryAsync();
        }
    }
}
