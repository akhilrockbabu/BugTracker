using BugTracker.DTOs;

namespace BugTracker.Services.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<AdminSummaryDto> GetAdminSummaryAsync();

    }
}
