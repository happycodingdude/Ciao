﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MyConnect.Repository;

#nullable disable

namespace MyConnect.Migrations
{
    [DbContext(typeof(CoreContext))]
    partial class CoreContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("MyConnect.Model.Attachment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<string>("MediaUrl")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<Guid>("MessageId")
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("MessageId");

                    b.ToTable("Attachment", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Contact", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("Avatar")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<bool>("IsOnline")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime?>("LastLogout")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.ToTable("Contact", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Conversation", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime?>("DeletedTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Title")
                        .HasMaxLength(250)
                        .HasColumnType("varchar(250)");

                    b.Property<DateTime?>("UpdatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.HasKey("Id");

                    b.ToTable("Conversation", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Message", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ContactId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Content")
                        .HasColumnType("longtext");

                    b.Property<Guid>("ConversationId")
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<bool>("IsLike")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsPinned")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("LikeCount")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("ContactId");

                    b.HasIndex("ConversationId");

                    b.ToTable("Message", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Participants", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ContactId")
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ConversationId")
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsModerator")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsNotifying")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("ContactId");

                    b.HasIndex("ConversationId");

                    b.ToTable("Participants", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Schedule", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Status")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.ToTable("Schedule", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.ScheduleContact", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ContactId")
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("CreatedTime")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                    b.Property<bool?>("IsDeleted")
                        .HasColumnType("tinyint(1)");

                    b.Property<Guid>("ScheduleId")
                        .HasColumnType("char(36)");

                    b.Property<DateTime?>("UpdatedTime")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("ContactId");

                    b.HasIndex("ScheduleId");

                    b.ToTable("ScheduleContact", (string)null);
                });

            modelBuilder.Entity("MyConnect.Model.Attachment", b =>
                {
                    b.HasOne("MyConnect.Model.Message", "Message")
                        .WithMany("Attachments")
                        .HasForeignKey("MessageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Message");
                });

            modelBuilder.Entity("MyConnect.Model.Message", b =>
                {
                    b.HasOne("MyConnect.Model.Contact", "Contact")
                        .WithMany("Messages")
                        .HasForeignKey("ContactId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyConnect.Model.Conversation", "Conversation")
                        .WithMany("Messages")
                        .HasForeignKey("ConversationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Contact");

                    b.Navigation("Conversation");
                });

            modelBuilder.Entity("MyConnect.Model.Participants", b =>
                {
                    b.HasOne("MyConnect.Model.Contact", "Contact")
                        .WithMany("Participants")
                        .HasForeignKey("ContactId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyConnect.Model.Conversation", "Conversation")
                        .WithMany("Participants")
                        .HasForeignKey("ConversationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Contact");

                    b.Navigation("Conversation");
                });

            modelBuilder.Entity("MyConnect.Model.ScheduleContact", b =>
                {
                    b.HasOne("MyConnect.Model.Contact", "Contact")
                        .WithMany("ScheduleContacts")
                        .HasForeignKey("ContactId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyConnect.Model.Schedule", "Schedule")
                        .WithMany("ScheduleContacts")
                        .HasForeignKey("ScheduleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Contact");

                    b.Navigation("Schedule");
                });

            modelBuilder.Entity("MyConnect.Model.Contact", b =>
                {
                    b.Navigation("Messages");

                    b.Navigation("Participants");

                    b.Navigation("ScheduleContacts");
                });

            modelBuilder.Entity("MyConnect.Model.Conversation", b =>
                {
                    b.Navigation("Messages");

                    b.Navigation("Participants");
                });

            modelBuilder.Entity("MyConnect.Model.Message", b =>
                {
                    b.Navigation("Attachments");
                });

            modelBuilder.Entity("MyConnect.Model.Schedule", b =>
                {
                    b.Navigation("ScheduleContacts");
                });
#pragma warning restore 612, 618
        }
    }
}
