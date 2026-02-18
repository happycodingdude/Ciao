import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "../hooks/useInfo";

export const Route = createFileRoute("/auth/_layout")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      // 1. Thử lấy dữ liệu user
      const user = await queryClient.ensureQueryData(userQueryOptions);

      // 2. Nếu ĐÃ đăng nhập mà vẫn cố vào /auth, thì đá sang trang chính
      if (user) {
        throw redirect({ to: "/conversations" });
      }
    } catch (error) {
      // 3. Nếu ĐÃ redirect ở trên thì ném error đó đi để Router xử lý
      if (isRedirect(error)) throw error;

      // 4. Nếu lỗi do chưa đăng nhập (API 401 chẳng hạn): 
      // KHÔNG LÀM GÌ CẢ (không redirect). 
      // Để người dùng tiếp tục ở lại trang /auth để login.
      console.log("User chưa đăng nhập, cho phép ở lại trang Auth");
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
