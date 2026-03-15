import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">View your tasks by due date.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Calendar view is being built. Check back soon!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Task due dates will be displayed here in a monthly calendar layout.</p>
        </CardContent>
      </Card>
    </div>
  );
}
