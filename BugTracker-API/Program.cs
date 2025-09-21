
//using BugTracker.Api.Data;
using BugTracker.Api.Repositories;
//using BugTracker.Api.Services.Interfaces;
using BugTracker.Api.Repositories.Interfaces;
using BugTracker.Api.Services;
//using BugTracker.Api.Repositories;
using BugTracker.Api.Services.Interfaces;
using BugTracker.Services;
//using BugTracker.Api.Services;
namespace BugTracker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            // Repositories
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IBugRepository, BugRepository>();
            builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddScoped<TeamRepository>();

            // Services
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IBugService, BugService>();
            builder.Services.AddScoped<IProjectService, ProjectService>();
            builder.Services.AddScoped<ICommentService, CommentService>();
            builder.Services.AddScoped<TeamService>();

            ////builder.Services.AddSingleton<BugTrackerContext>();
            //builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            //builder.Services.AddScoped<ICommentService, CommentService>();
            //// Add repositories
            //builder.Services.AddScoped<IUserRepository, UserRepository>();

            //builder.Services.AddScoped<IBugRepository, BugRepository>();
            //builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
            //builder.Services.AddScoped<IUserRepository, UserRepository>();

            //builder.Services.AddScoped<IBugService, BugService>();
            //builder.Services.AddScoped<TeamRepository>();
            //builder.Services.AddScoped<TeamService>();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            //builder.Services.AddSwaggerGen();
            //// ...
            //app.UseSwagger();
            //app.UseSwaggerUI();
            // Add services
            builder.Services.AddScoped<IUserService, UserService>();

            var app = builder.Build();
            app.UseCors(builder =>
                    builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
            );

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
