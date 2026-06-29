
namespace Infrastructure.Repositories;

public class ConversationRepository : MongoBaseRepository<Conversation>, IConversationRepository
{
    readonly IMapper _mapper;
    readonly IContactRepository _contactRepository;

    public ConversationRepository(MongoDbContext context,
        IUnitOfWork uow,
        IMapper mapper,
        IContactRepository contactRepository)
        : base(context, uow)
    {
        _mapper = mapper;
        _contactRepository = contactRepository;
    }

    public async Task<IEnumerable<ConversationWithTotalUnseenWithContactInfo>> GetConversationsWithUnseenMesages(string userId, PagingParam pagingParam)
    {
        // Pipeline aggregate Mongo phức tạp 7 stage. Lưu ý hiệu năng:
        //  - $match đầu phải hit index { "Members.ContactId": 1 } để tránh COLLSCAN.
        //  - $unwind nhân số document theo số member → kích thước trung gian = N_conversations * avg_members.
        //    Đảm bảo $match đặt TRƯỚC $unwind (đã đúng), tuyệt đối không đảo thứ tự.
        //  - 2 lookup chạy lần lượt cho từng member đã unwind: cần index trên Friend.FromContact.ContactId,
        //    Friend.ToContact.ContactId và Contact._id để tránh nested loop O(N*M).
        //  - $group gom lại theo conversation _id, dùng $first cho field non-array và $push cho Members.
        //  - $sort + $skip + $limit ở cuối: $sort trên UpdatedTime nên cần index { UpdatedTime: -1 }
        //    (hoặc sort sau $project để Mongo dùng được index).
        //  - Khi dataset lớn, cân nhắc thêm allowDiskUse hoặc tách 2 query (conversations + members) ở app.

        var pipeline = new BsonDocument[]
        {
            // Stage 1: lọc chỉ những conversation có member là userId hiện tại.
            new BsonDocument("$match", new BsonDocument("Members", new BsonDocument("$elemMatch",
                new BsonDocument
                {
                    {"ContactId", userId},
                    // {"IsDeleted", false},
                }))),
            new BsonDocument("$unwind", "$Members"),
            
            // Lookup stage
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Friend" },
                { "let", new BsonDocument("contactId", "$Members.ContactId") },  // Define variable contactId from Contact's _id
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument("$expr",
                            new BsonDocument("$or", new BsonArray
                            {
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", "$$contactId" }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", userId })
                                }),
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", userId }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", "$$contactId" })
                                })
                            })
                        ))
                    }
                },
                { "as", "MatchingFriends" }
            }),
            
            // Lookup stage
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Contact" },
                { "let", new BsonDocument("contactId", "$Members.ContactId") },  // Define variable contactId from Contact's _id
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument("$expr",
                            new BsonDocument("$eq", new BsonArray { "$_id", "$$contactId" })
                        ))
                    }
                },
                { "as", "MatchingContact" }
            }),
                        
            // Group state
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$_id" },
                { "Title", new BsonDocument("$first", "$Title") },
                { "Avatar", new BsonDocument("$first", "$Avatar") },
                { "IsGroup", new BsonDocument("$first", "$IsGroup") },
                { "UpdatedTime", new BsonDocument("$first", "$UpdatedTime") },
                { "Messages", new BsonDocument("$first", "$Messages") },
                { "Members", new BsonDocument("$push", new BsonDocument
                    {
                        { "_id", "$Members._id" },
                        { "IsDeleted", "$Members.IsDeleted" },
                        { "IsModerator", "$Members.IsModerator" },
                        { "IsNotifying", "$Members.IsNotifying" },
                        { "ContactId", "$Members.ContactId" },
                        { "LastSeenTime", "$Members.LastSeenTime" },
                        { "Contact", new BsonDocument("$first", "$MatchingContact")},
                        // { "FriendId", new BsonDocument("$first", "$MatchingFriends._id") },
                        // { "FriendStatus", new BsonDocument("$cond", new BsonArray
                        //     {
                        //         new BsonDocument("$eq", new BsonArray { new BsonDocument("$size", "$MatchingFriends"), 0 }),
                        //         "new",
                        //         new BsonDocument("$cond", new BsonArray
                        //         {
                        //             new BsonDocument("$ne", new BsonArray { new BsonDocument("$first", "$MatchingFriends.AcceptTime"), BsonNull.Value }),
                        //             "friend",
                        //             new BsonDocument("$cond", new BsonArray
                        //             {
                        //                 new BsonDocument("$eq", new BsonArray { new BsonDocument("$first", "$MatchingFriends.FromContact.ContactId"), userId }),
                        //                 "request_sent",
                        //                 "request_received"
                        //             })
                        //         })
                        //     })
                        // }
                    })
                },
            }),
            
            // Project state
            new BsonDocument("$project", new BsonDocument
            {
                { "Title", 1 },
                { "Avatar", 1 },
                { "IsGroup", 1 },
                { "UpdatedTime", 1 },
                { "Members", 1 },
                { "Messages", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", "$Messages" }, // Process the collected Messages array
                        { "as", "message" },
                        { "in", new BsonDocument
                            {
                                { "_id", "$$message._id" },
                                { "Type", "$$message.Type" },
                                { "Content", "$$message.Content" },
                                { "ContactId", "$$message.ContactId" },
                                { "IsPinned", "$$message.IsPinned" },
                                { "PinnedBy", "$$message.PinnedBy" },
                                { "IsForwarded", "$$message.IsForwarded" },
                                { "ReplyId", "$$message.ReplyId" },
                                { "ReplyContent", "$$message.ReplyContent" },
                                { "ReplyContact", "$$message.ReplyContact" },
                                { "Attachments", "$$message.Attachments" },
                                { "CreatedTime", "$$message.CreatedTime" },
                                { "Reactions", "$$message.Reactions" }
                            }
                        }
                    })
                }
            }),

            new BsonDocument("$sort", new BsonDocument("UpdatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit)
        };

        // Deserialize thủ công qua BsonSerializer vì pipeline có shape động (Members.Contact lấy từ $first lookup),
        // không map 1-1 với entity gốc nên không dùng được Aggregate<TOut> trực tiếp.
        var conversations = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<ConversationWithTotalUnseenWithContactInfo>(bson))
            .ToList();
        if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseenWithContactInfo>();

        // Tính LastMessage* ở phía app thay vì trong pipeline để code đỡ nặng và dễ bảo trì.
        // Trade-off: nếu Messages của 1 conversation rất dài (history lớn) thì OrderByDescending O(N) ở client
        // có thể tốn CPU — cân nhắc giới hạn Messages ở pipeline ($slice) khi dữ liệu phình to.
        foreach (var conversation in conversations)
        {
            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                conversation.LastMessageId = lastMessage.Id;
                conversation.LastMessage = lastMessage.Type == "text" ? lastMessage.Content : string.Join(",", lastMessage.Attachments.Select(q => q.MediaName));
                conversation.LastMessageTime = lastMessage.CreatedTime;
                conversation.LastMessageContact = lastMessage.ContactId;
                conversation.HasAttachment = lastMessage.Attachments.Any();
            }
        }

        return conversations;
    }

    public async Task<List<MessageSearchResult>> SearchMessages(string conversationId, string keyword, PagingParam pagingParam, CancellationToken cancellationToken = default)
    {
        // Pipeline search message theo keyword trong 1 conversation cụ thể.
        // Chiến thuật: $unwind Messages rồi $match content regex để Mongo lọc tại DB,
        // tránh load toàn bộ document Messages về app rồi mới filter.
        //
        // Hiệu năng:
        //  - $match đầu hit _id index → O(1) tìm conversation
        //  - $unwind nhân số = số messages của conversation
        //  - $match regex /keyword/i KHÔNG hit index (regex case-insensitive là COLLSCAN trên array sau unwind)
        //    → tạm chấp nhận; tương lai có thể thêm text index riêng nếu lượng message lớn.
        //  - Escape keyword qua Regex.Escape để chống regex injection (user nhập ".*" v.v).
        //
        // Chỉ lấy message type="text" — image/system không có content meaningful để match keyword.
        var escaped = System.Text.RegularExpressions.Regex.Escape(keyword);
        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("_id", conversationId)),
            new BsonDocument("$unwind", "$Messages"),
            new BsonDocument("$match", new BsonDocument
            {
                { "Messages.Type", "text" },
                { "Messages.Content", new BsonRegularExpression(escaped, "i") },
                // Loại tin đã thu hồi (Content đã bị clear nhưng vẫn cần loại theo cờ để chắc chắn).
                { "Messages.RecalledTime", BsonNull.Value }
            }),
            new BsonDocument("$sort", new BsonDocument("Messages.CreatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit),
            // Ép Messages thành root document để deserialize trực tiếp về MessageSearchResult.
            new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$Messages")),
            new BsonDocument("$project", new BsonDocument
            {
                { "_id", 1 },
                { "Type", 1 },
                { "Content", 1 },
                { "ContactId", 1 },
                { "CreatedTime", 1 }
            })
        };

        // AllowDiskUse=true: $sort sau $unwind chạy in-memory; conversation nhiều tin match có thể
        // vượt giới hạn 100MB của aggregation → bật spill ra disk để query không fail đột ngột.
        // (Band-aid: fix gốc là tách Messages ra collection riêng + index, xem note trên.)
        // CancellationToken: client hủy request (đổi keyword/đóng panel) → dừng luôn việc ở DB.
        var results = (await _collection
            .Aggregate<BsonDocument>(pipeline, new AggregateOptions { AllowDiskUse = true }, cancellationToken)
            .ToListAsync(cancellationToken))
            .Select(bson => BsonSerializer.Deserialize<MessageSearchResult>(bson))
            .ToList();

        return results;
    }
}