import * as signalR from "@microsoft/signalr";

export let hubConnection: signalR.HubConnection | null = null;

export const startConnection = async (
  id: string,
  register: (token: string) => void,
) => {
  if (!id) {
    console.error("User ID is required to establish a connection.");
    return;
  }

  hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:4000/ciaohub?userId=${id}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  try {
    await hubConnection.start();
    console.log(`SignalR Connected for user: ${id}`);
    // Get the connection ID from the backend
    const connectionId = await hubConnection.invoke<string>("GetConnectionId");
    register(connectionId);
    console.log(`Connection ID: ${connectionId}`);
    hubConnection.on("NewMessage", (message: string) => {
      console.log(message);
    });
  } catch (error) {
    console.error("SignalR Connection Error: ", error);
  }
};

export const onMessageReceived = (callback: (message: string) => void) => {
  if (hubConnection) {
    hubConnection.on("NewMessage", (message: string) => {
      console.log(message);
    });
  } else {
    console.error("SignalR connection is not established.");
  }
};
