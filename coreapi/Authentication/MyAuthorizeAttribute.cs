using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class MyAuthorizeAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly string _tokenHeaderName;

    public MyAuthorizeAttribute(string tokenHeaderName)
    {
        _tokenHeaderName = tokenHeaderName;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(_tokenHeaderName, out var token))
        {
            HandleUnauthorizedRequest(context);
            return;
        }

        try
        {
            context.HttpContext.Session.SetString("Token", token);
            // Validate token here
            if (!IsValidToken(token))
            {
                HandleUnauthorizedRequest(context);
            }
        }
        catch (Exception)
        {
            HandleUnauthorizedRequest(context);
        }
    }

    private void HandleUnauthorizedRequest(AuthorizationFilterContext context)
    {
        context.Result = new StatusCodeResult(401);
    }

    private bool IsValidToken(string token)
    {
        // Implement token validation logic here
        return true;
    }
}