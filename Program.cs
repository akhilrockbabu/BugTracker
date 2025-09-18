
//using BugTracker.Api.Data;
using BugTracker.Api.Repositories;
using BugTracker.Api.Services;
//using BugTracker.Api.Services.Interfaces;
using BugTracker.Api.Repositories.Interfaces;
//using BugTracker.Api.Repositories;
using BugTracker.Api.Services.Interfaces;
//using BugTracker.Api.Services;
namespace BugTracker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                                  policy =>
                                  {
                                      policy.WithOrigins("http://localhost:4200")
                                            .AllowAnyHeader()
                                            .AllowAnyMethod();
                                  });
            });

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddScoped<IProjectRepository,ProjectRepository>();

            builder.Services.AddScoped<ILabelRepository,LabelRepository>();
            builder.Services.AddScoped<IProjectService, ProjectService>();
            

            //builder.Services.AddSingleton<BugTrackerContext>();
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddScoped<ICommentService, CommentService>();
            // Add repositories
            builder.Services.AddScoped<IUserRepository, UserRepository>();

            builder.Services.AddScoped<IBugRepository, BugRepository>();

            builder.Services.AddScoped<IBugService, BugService>();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            // Add services
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ILabelService, LabelService>();
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors(MyAllowSpecificOrigins);

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
