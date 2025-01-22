global using Application.Caching;
global using Application.Repositories;
global using Infrastructure.Repositories;
global using Microsoft.AspNetCore.Authorization;
global using Shared.Constants;
global using Infrastructure.Caching;
global using Infrastructure.Middleware.Authentication;
global using Infrastructure.Middleware.Exceptions;
global using Application.Notifications;
global using Infrastructure.Notifications;
global using System.Reflection;
global using Infrastructure.Databases;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using Infrastructure.RequestPipeline;
global using Microsoft.AspNetCore.Identity;
global using Application.DTOs;
global using Microsoft.AspNetCore.Http.Json;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Shared.Utils;
global using StackExchange.Redis;
global using Application.Jwt;
global using Application.Kafka.Producer;
global using Infrastructure.BackgroundJobs;
global using Infrastructure.Kafka.Producer;
global using Application.Kafka.Model;
global using Infrastructure.Configurations;
global using Microsoft.Extensions.Options;
global using SendProcessor.ConsumerHandler;
global using SendProcessor.RequestPipeline;
global using SendProcessor.Configurations;
global using SendProcessor.Implementations;
global using SendProcessor.Interfaces;
global using Application.Specifications;
global using AutoMapper;
global using Domain.Entities;
global using Newtonsoft.Json;