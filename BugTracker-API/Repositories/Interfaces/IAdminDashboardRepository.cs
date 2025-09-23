using BugTracker.DTOs;

namespace BugTracker.Repositories.Interfaces
{
    public interface IAdminDashboardRepository
    {
        Task<AdminSummaryDto> GetAdminSummaryAsync();

    }
}
