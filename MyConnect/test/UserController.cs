using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using MyConnect;
using MyConnect.Controllers;
using MyConnect.Model;
using MyConnect.UOW;
using Newtonsoft.Json;

namespace ApiTest;

public class Tests
{
    private IHttpContextAccessor? httpContextAccessor;
    private IUnitOfWork? unitOfWork;
    private IConfiguration? configuration;
    private UserController? controller;

    [SetUp]
    public void Setup()
    {
        var webHost = WebHost.CreateDefaultBuilder().UseStartup<Startup>().Build();
        httpContextAccessor = (IHttpContextAccessor)webHost.Services.GetService(typeof(IHttpContextAccessor));
        unitOfWork = (IUnitOfWork)webHost.Services.GetService(typeof(IUnitOfWork));
        configuration = (IConfiguration)webHost.Services.GetService(typeof(IConfiguration));
        controller = new UserController(configuration, unitOfWork);
    }

    [Test]
    public async Task User_Login_ReturnToken()
    {
        //Arrange
        var model = new LoginRequest
        {
            Username = "tringuyen",
            Password = "123456"
        };
        //Act
        var response = (ResponseModel<LoginResponse>)await controller.LoginAsync(model);
        //Assert
        Assert.Null(response.error);
        Console.WriteLine(JsonConvert.SerializeObject(response));
    }

    [Test]
    public void User_ValidateToken_ReturnId()
    {
        //Arrange
        var mockContext = new Mock<HttpContext>();
        var mockSession = new MockHttpSession();
        mockSession["Token"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwOGE3YWIwLWMyZDktNDFjYy0zYjAxLTA4ZGJlNjVjMTEyZiIsInVzZXJuYW1lIjoidHJpbmd1eWVuIiwibmJmIjoxNzAwNjM2Njg2LCJleHAiOjE3MDMyMjg2ODYsImlhdCI6MTcwMDYzNjY4Nn0.Lc7aOH7LTSCvE0pmyaOwAdo1C41Ce2aGW4t_bz5_ki8";
        mockContext.Setup(s => s.Session).Returns(mockSession);
        httpContextAccessor.HttpContext = mockContext.Object;
        //Act
        var response = (ResponseModel<Contact>)controller.ValidateToken();
        //Assert
        Assert.Null(response.error);
        Console.WriteLine(JsonConvert.SerializeObject(response));
    }
}