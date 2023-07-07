﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MyDockerWebAPI.Repository;

#nullable disable

namespace MyDockerWebAPI.Migrations
{
    [DbContext(typeof(MigrationContext))]
    partial class MigrationContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("MyDockerWebAPI.Model.Form", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int?>("Budget")
                        .HasColumnType("int");

                    b.Property<DateTime?>("CreateTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime?>("ModifyTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Form", (string)null);

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Budget = 100000,
                            Name = "Form 1"
                        });
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Location", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("CreateTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime?>("ModifyTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Location", (string)null);

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Address = "Address 1",
                            Name = "Location 1"
                        });
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Participant", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime?>("CreateTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime?>("ModifyTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Participant", (string)null);

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Name = "Participant 1"
                        });
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Submission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime?>("CreateTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<int>("FormId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("FromTime")
                        .IsRequired()
                        .HasColumnType("datetime(6)");

                    b.Property<int>("LocationId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifyTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Note")
                        .HasColumnType("longtext");

                    b.Property<int>("ParticipantId")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("varchar(10)");

                    b.Property<DateTime?>("ToTime")
                        .IsRequired()
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("FormId");

                    b.HasIndex("LocationId");

                    b.HasIndex("ParticipantId");

                    b.ToTable("Submission", (string)null);

                    b.HasData(
                        new
                        {
                            Id = 1,
                            FormId = 1,
                            FromTime = new DateTime(2023, 7, 9, 18, 0, 0, 0, DateTimeKind.Local),
                            LocationId = 1,
                            Note = "Note 1",
                            ParticipantId = 1,
                            Status = "draft",
                            ToTime = new DateTime(2023, 7, 9, 19, 0, 0, 0, DateTimeKind.Local)
                        },
                        new
                        {
                            Id = 2,
                            FormId = 1,
                            FromTime = new DateTime(2023, 7, 9, 18, 0, 0, 0, DateTimeKind.Local),
                            LocationId = 1,
                            Note = "Note 2",
                            ParticipantId = 1,
                            Status = "draft",
                            ToTime = new DateTime(2023, 7, 9, 19, 0, 0, 0, DateTimeKind.Local)
                        });
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime?>("CreateTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime?>("ModifyTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(250)
                        .HasColumnType("varchar(250)");

                    b.Property<int?>("RetryTime")
                        .HasColumnType("int");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("User", (string)null);

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Name = "User 1",
                            Password = "dGVzdA==",
                            Username = "test"
                        });
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Submission", b =>
                {
                    b.HasOne("MyDockerWebAPI.Model.Form", "Form")
                        .WithMany("Submissions")
                        .HasForeignKey("FormId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyDockerWebAPI.Model.Location", "Location")
                        .WithMany("Submissions")
                        .HasForeignKey("LocationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyDockerWebAPI.Model.Participant", "Participant")
                        .WithMany("Submissions")
                        .HasForeignKey("ParticipantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Form");

                    b.Navigation("Location");

                    b.Navigation("Participant");
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Form", b =>
                {
                    b.Navigation("Submissions");
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Location", b =>
                {
                    b.Navigation("Submissions");
                });

            modelBuilder.Entity("MyDockerWebAPI.Model.Participant", b =>
                {
                    b.Navigation("Submissions");
                });
#pragma warning restore 612, 618
        }
    }
}
