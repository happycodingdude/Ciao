global using AutoMapper;
global using Chat.API.Features;
global using Chat.API.Model;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.EntityFrameworkCore;
global using System.Text;
global using System.Text.Json.Serialization;
global using Microsoft.AspNetCore.Mvc;
global using Chat.API.BaseService;
global using Carter;
global using Domain.Features;
global using MediatR;
global using Infrastructure.Repositories;
global using Infrastructure.Databases;
global using Microsoft.AspNetCore.JsonPatch;
global using Infrastructure.Constants;
global using Infrastructure.Middleware.Exceptions;
global using Infrastructure.Middleware.Authentication;
global using System.Text.Json;
global using Newtonsoft.Json;
global using FluentValidation;
global using Infrastructure.RequestPipeline;
global using Chat.API.Configuration;
global using Chat.API.Features.Contacts;
global using Chat.API.Features.Participants;
global using Chat.API.Features.Conversations;
global using Chat.API.Features.Notifications;
global using Chat.API.Features.Friends;
global using Chat.API.Features.Schedules;
global using Chat.API.Features.ScheduleContacts;
global using Infrastructure.Utils;
global using Infrastructure.Utils.Firebase;
global using FirebaseAdmin;
global using Google.Apis.Auth.OAuth2;
global using FirebaseAdmin.Messaging;
global using Message = Domain.Features.Message;
global using Notification = Domain.Features.Notification;