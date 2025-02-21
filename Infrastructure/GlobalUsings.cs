global using Microsoft.EntityFrameworkCore;
global using Infrastructure.Databases;
global using Microsoft.AspNetCore.Authorization;
global using Newtonsoft.Json;
global using Infrastructure.Middleware;
global using System.Data;
global using Microsoft.AspNetCore.Diagnostics;
global using FirebaseAdmin;
global using Google.Apis.Auth.OAuth2;
global using FirebaseAdmin.Messaging;
global using Message = Domain.Entities.Message;
global using Notification = Domain.Entities.Notification;
global using Newtonsoft.Json.Serialization;
global using Application.DTOs;
global using Application.Notifications;
global using Application.Caching;
global using Microsoft.Extensions.Caching.Distributed;
global using Application.Repositories;
global using Application.Exceptions;
global using AutoMapper;
global using MongoDB.Driver;
global using System.Reflection;
global using Application.Specifications;
global using MongoDB.Bson;
global using MongoDB.Bson.Serialization;
global using Shared.Constants;
global using Microsoft.AspNetCore.Http;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.AspNetCore.Builder;
global using Microsoft.Extensions.Configuration;
global using StackExchange.Redis;
global using Domain.Entities;
global using Domain.Base;
global using Application.Jwt;
global using System.Text;
global using System.IdentityModel.Tokens.Jwt;
global using System.Security.Claims;
global using Microsoft.IdentityModel.Tokens;
global using System.Security.Cryptography;
global using Confluent.Kafka;
global using Application.Kafka.Producer;
global using System.Net;
global using Microsoft.Extensions.Hosting;
global using Infrastructure.Configurations;
global using Microsoft.Extensions.Options;
global using Confluent.Kafka.Admin;
global using Application.Kafka.Model;
global using Microsoft.AspNetCore.SignalR;