// src/utils/SignalManager.ts
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

let connection: HubConnection | null = null;

export const getSignalConnection = async (
  userId: string,
): Promise<HubConnection> => {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(
      `${import.meta.env.VITE_ASPNETCORE_CHAT_URL}/ciaohub?userId=${userId}`,
    )
    .withAutomaticReconnect()
    .build();

  await connection.start();
  console.log("✅ SignalR connected");
  return connection;
};

export const stopSignalConnection = async () => {
  if (connection) {
    await connection.stop();
    console.log("🛑 SignalR stopped");
    connection = null;
  }
};
