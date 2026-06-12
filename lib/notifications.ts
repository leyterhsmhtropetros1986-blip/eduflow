export interface SendNotificationParams {
  type: "absence" | "scheduleChange" | "payment" | "birthday" | "announcement";

  recipientId: string;

  recipientName: string;

  recipientEmail?: string;

  recipientPhone?: string;

  studentId?: string;

  studentName?: string;

  channel: "email" | "sms" | "push";

  title: string;

  message: string;
}

export function sendNotification(
  params: SendNotificationParams
) {
  const notifications = JSON.parse(
    localStorage.getItem("eduflow_notifications") || "[]"
  );

  const notification = {
    id: crypto.randomUUID(),

    ...params,

    status: "sent",

    createdAt: new Date().toLocaleString("el-GR"),

    sentAt: new Date().toISOString(),
  };

  notifications.unshift(notification);

  localStorage.setItem(
    "eduflow_notifications",
    JSON.stringify(notifications)
  );

  console.log("Notification:", notification);

  return notification;
}