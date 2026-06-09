import { NextResponse } from "next/server";

export async function GET() {
  const schedule = [
    {
      day: "Δευτέρα",
      time: "16:00",
      course: "Μαθηματικά Γ3",
      teacher: "Παπαδόπουλος",
      classroom: "Α1",
    },
    {
      day: "Τρίτη",
      time: "17:00",
      course: "Φυσική Β2",
      teacher: "Γεωργίου",
      classroom: "Α2",
    },
  ];

  return NextResponse.json({
    success: true,
    schedule,
  });
}