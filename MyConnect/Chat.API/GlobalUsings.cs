global using Domain.Constants;
global using AutoMapper;
global using Chat.API.Interface;
global using Chat.API.Model;
global using Microsoft.AspNetCore.JsonPatch;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.EntityFrameworkCore;
global using MyDockerWebAPI.RestApi;
global using Chat.API.RestApi;
global using Chat.API.Implement;
global using Chat.API.Middleware;
global using Chat.API.Authentication;
global using Microsoft.AspNetCore.Diagnostics;
global using System.ComponentModel.DataAnnotations;
global using System.Text;
global using Domain.Utils;
global using System.Net.Http.Headers;
global using Infrastructure.Repository;
global using Infrastructure.UOW;
global using Domain.Exceptions;
global using System.Text.Json.Serialization;
global using Microsoft.AspNetCore.Mvc.Filters;
global using Microsoft.AspNetCore.Mvc;