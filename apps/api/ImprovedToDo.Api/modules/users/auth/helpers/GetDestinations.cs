using System.Security.Claims;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

public static class ClaimsHelper
{
  public static IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
  {
      switch (claim.Type)
      {
          //case Claims.Name:
          case Claims.Email:
          case Claims.Role:
              yield return Destinations.AccessToken;

              if (principal.HasScope(Scopes.OpenId) || principal.HasScope(Scopes.Profile))
              {
                  yield return Destinations.IdentityToken;
              }
              yield break;

          case "AspNet.Identity.SecurityStamp":
              yield break;

          default:
              yield return Destinations.AccessToken;
              yield break;
      }
  }
}