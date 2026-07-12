namespace Presentation.Invites;

// Phase 5 — Đợt 2: shape trả về cho quản trị khi xem/tạo link mời.
// Expired tính sẵn ở BE để FE không phụ thuộc lệch giờ client.
public record InviteDto(string Code, bool RequireApproval, DateTime? ExpireTime, DateTime CreatedTime, bool Expired)
{
    public static InviteDto? From(GroupInvite? invite) =>
        invite is null
            ? null
            : new InviteDto(invite.Code, invite.RequireApproval, invite.ExpireTime, invite.CreatedTime,
                invite.ExpireTime is not null && invite.ExpireTime < DateTime.UtcNow);
}
