import { auth } from "@/auth";
import { Settings2 } from "lucide-react";
import { NameForm } from "./_components/name-form";
import { PasswordForm } from "./_components/password-form";
import { ThemeSettings } from "./_components/theme-settings";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings2 className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      <NameForm currentName={session?.user?.name ?? ""} />
      <PasswordForm />
      <ThemeSettings />
    </div>
  );
}
