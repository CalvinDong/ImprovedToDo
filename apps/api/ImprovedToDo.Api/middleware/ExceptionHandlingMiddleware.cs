using System.Text.Json;
using Api.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Request was cancelled by the client.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred for request {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            await WriteProblemDetailsAsync(context, ex);
        }
    }

    private static async Task WriteProblemDetailsAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, type, errors) = MapException(exception);

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Type = type,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        if (errors is not null)
        {
            problem.Extensions["errors"] = errors;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problem);

        await context.Response.WriteAsync(json);
    }

    private static (int StatusCode, string Title, string Type, IDictionary<string, string[]>? Errors)
        MapException(Exception exception)
    {
        return exception switch
        {
            ValidationException validationException => (
                StatusCodes.Status400BadRequest,
                "Validation failed",
                "https://httpstatuses.com/400",
                validationException.Errors
            ),

            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Resource not found",
                "https://httpstatuses.com/404",
                null
            ),

            ForbiddenException => (
                StatusCodes.Status403Forbidden,
                "Forbidden",
                "https://httpstatuses.com/403",
                null
            ),

            ConflictException => (
                StatusCodes.Status409Conflict,
                "Conflict",
                "https://httpstatuses.com/409",
                null
            ),

            DbUpdateConcurrencyException => (
                StatusCodes.Status409Conflict,
                "Concurrency conflict",
                "https://httpstatuses.com/409",
                null
            ),

            DbUpdateException => (
                StatusCodes.Status500InternalServerError,
                "Database error",
                "https://httpstatuses.com/500",
                null
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Server error",
                "https://httpstatuses.com/500",
                null
            )
        };
    }
}